import urlcat from 'urlcat'
import Web3SDK from 'web3'
import type { AbiItem } from 'web3-utils'
import { first } from 'lodash-es'
import { createLookupTableResolver, EMPTY_LIST } from '@masknet/shared-base'
import ERC721ABI from '@masknet/web3-contracts/abis/ERC721.json'
import type { ERC721 } from '@masknet/web3-contracts/types/ERC721.js'
import {
    formatPercentage,
    NonFungibleAsset,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    resolveResourceURL,
    scale10,
    SourceType,
    TokenType,
} from '@masknet/web3-shared-base'
import { ChainId, createContract, getRPCConstants, SchemaType, WNATIVE } from '@masknet/web3-shared-evm'
import { NFTSCAN_BASE, NFTSCAN_LOGO_BASE, NFTSCAN_URL, NFTSCAN_API, NFTSCAN_RESTFUL_API } from '../constants.js'
import type { EVM } from '../types/EVM.js'
import type { NonFungibleTokenAPI } from '../../entry-types.js'
import { getAssetFullName } from '../../helpers/getAssetFullName.js'
import { resolveActivityType } from '../../helpers/resolveActivityType.js'
import { getPaymentToken } from '../../helpers/getPaymentToken.js'
import { parseJSON } from '../../helpers/parseJSON.js'

export type NFTScanChainId = ChainId.Mainnet | ChainId.Matic | ChainId.BSC | ChainId.Arbitrum | ChainId.Optimism

export const resolveNFTScanHostName = createLookupTableResolver<NFTScanChainId, string>(
    {
        [ChainId.Mainnet]: 'https://www.nftscan.com',
        [ChainId.Matic]: 'https://polygon.nftscan.com',
        [ChainId.BSC]: 'https://bnb.nftscan.com',
        [ChainId.Arbitrum]: 'https://arbitrum.nftscan.com/',
        [ChainId.Optimism]: 'https://optimism.nftscan.com/',
    },
    '',
)

export async function fetchFromNFTScanV2<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    const host = resolveNFTScanHostName(chainId as NFTScanChainId)
    if (!host) return

    const response = await fetch(urlcat(NFTSCAN_URL, pathname), {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...init?.headers,
            'x-app-chainid': chainId.toString(),
        },
        cache: 'no-cache',
    })
    const json = await response.json()
    return json as T
}

export async function fetchFromNFTScanRestFulAPI<T>(pathname: string, body: string, init?: RequestInit) {
    const response = await fetch(urlcat(NFTSCAN_RESTFUL_API, pathname), {
        ...init,
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...init?.headers,
            'x-api-key': 'YQ3S6KXZ',
        },
        cache: 'no-cache',
        body,
    })
    const json = await response.json()
    return json as T
}

const NFTScanAPIChainResolver = createLookupTableResolver<NFTScanChainId, string>(
    {
        [ChainId.Mainnet]: 'ETH',
        [ChainId.Matic]: 'MATIC',
        [ChainId.BSC]: 'BNB',
        [ChainId.Arbitrum]: 'Arbitrum',
        [ChainId.Optimism]: 'Optimism',
    },
    () => 'ETH',
)

export async function fetchFromNFTScanWebAPI<T>(chainId: ChainId, pathname: string, init?: RequestInit) {
    const host = resolveNFTScanHostName(chainId as NFTScanChainId)
    if (!host) return

    const response = await fetch(urlcat(NFTSCAN_API, pathname), {
        ...init,
        headers: {
            'content-type': 'application/json',
            ...init?.headers,
            chain: NFTScanAPIChainResolver(chainId as NFTScanChainId),
        },
        cache: 'no-cache',
    })
    const json = await response.json()
    return json as T
}

export async function getContractSymbol(address: string, chainId: ChainId) {
    const RPC_URL = first(getRPCConstants(chainId).RPC_URLS)
    if (!RPC_URL) return ''

    try {
        const web3 = new Web3SDK(RPC_URL)
        const contract = createContract<ERC721>(web3, address, ERC721ABI as AbiItem[])
        const symbol = await contract?.methods.symbol().call({})
        return symbol ?? ''
    } catch {
        return ''
    }
}

export function createPermalink(chainId: ChainId, address: string, tokenId: string) {
    return urlcat(
        resolveNFTScanHostName(chainId as NFTScanChainId) || 'https://www.nftscan.com',
        '/:address/:tokenId',
        {
            address,
            tokenId,
        },
    )
}

export function createNonFungibleAsset(
    chainId: ChainId,
    asset: EVM.Asset,
    collection?: EVM.Collection | EVM.AssetsGroup,
): NonFungibleAsset<ChainId, SchemaType> {
    const payload = parseJSON<EVM.Payload>(asset.metadata_json)
    const contractName = asset.contract_name
    const description = payload?.description ?? collection?.description
    const uri = asset.nftscan_uri ?? asset.image_uri
    const mediaURL = resolveResourceURL(uri)

    const creator = asset.minter
    const owner = asset.owner
    const schema = asset.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721
    const symbol = asset.contract_name

    return {
        id: asset.contract_address,
        chainId,
        link: createPermalink(chainId, asset.contract_address, asset.token_id),
        tokenId: asset.token_id,
        type: TokenType.NonFungible,
        address: asset.contract_address,
        schema,
        creator: {
            address: creator,
            link: urlcat(NFTSCAN_BASE, creator),
        },
        owner: owner
            ? {
                  address: owner,
                  link: urlcat(NFTSCAN_BASE, owner),
              }
            : undefined,
        traits:
            asset.attributes?.map((x) => ({
                type: x.attribute_name,
                value: x.attribute_value,
                rarity: x.percentage,
            })) ?? EMPTY_LIST,
        priceInToken: asset.latest_trade_price
            ? {
                  amount: scale10(asset.latest_trade_price, WNATIVE[chainId].decimals).toFixed(),
                  // FIXME: cannot get payment token
                  token: WNATIVE[chainId],
              }
            : undefined,
        metadata: {
            chainId,
            name: getAssetFullName(asset.contract_address, contractName, payload?.name || asset.name, asset.token_id),
            symbol,
            description,
            imageURL: mediaURL,
            mediaURL,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            name: contractName,
            symbol,
            creatorEarning:
                collection && 'royalty' in collection ? formatPercentage(collection.royalty / 100 / 100) : undefined,
        },
        collection: {
            chainId,
            name: contractName,
            slug: contractName,
            description,
            address: asset.contract_address,
            // If collectionContext.logo_url is null, we will directly render a fallback logo instead.
            // So do not fallback to the constructed NFTScan logo url
            iconURL: collection ? collection.logo_url : `${urlcat(NFTSCAN_LOGO_BASE, asset.contract_address)}.png`,
            // TODO fetch via `collections` API
            verified: false,
            createdAt: asset.mint_timestamp,
        },
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollectionFromGroup(
    chainId: ChainId,
    group: EVM.AssetsGroup,
): NonFungibleCollection<ChainId, SchemaType> {
    const sample = first(group.assets)
    const payload = parseJSON<EVM.Payload>(sample?.metadata_json)
    return {
        chainId,
        schema: sample?.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: group.contract_name,
        slug: group.contract_name,
        address: group.contract_address,
        description: group.description || payload?.description,
        iconURL: group.logo_url,
        tokensTotal: group.assets.length,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleCollectionFromCollection(
    chainId: ChainId,
    collection: NonFungibleTokenAPI.Collection,
): NonFungibleCollection<ChainId, SchemaType> {
    return {
        chainId,
        schema: collection.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        name: collection.name,
        symbol: collection.symbol,
        slug: collection.symbol,
        address: collection.contract_address,
        description: collection.description,
        iconURL: collection.logo_url,
        verified: collection.verified,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleTokenContract(
    chainId: ChainId,
    collection: NonFungibleTokenAPI.Collection,
): NonFungibleTokenContract<ChainId, SchemaType> {
    return {
        chainId,
        address: collection.contract_address,
        name: collection.name,
        symbol: collection.symbol,
        schema: collection.erc_type === 'erc1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        iconURL: collection.logo_url,
        logoURL: collection.logo_url,
        owner: collection.owner,
        source: SourceType.NFTScan,
    }
}

export function createNonFungibleTokenEvent(
    chainId: ChainId,
    transaction: EVM.Transaction,
): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken = getPaymentToken(chainId, { symbol: transaction.trade_symbol })
    return {
        chainId,
        id: transaction.hash,
        quantity: transaction.amount,
        timestamp: transaction.timestamp,
        type: resolveActivityType(transaction.event_type),
        hash: transaction.hash,
        from: {
            address: transaction.from,
        },
        to: {
            address: transaction.to,
        },
        assetName: transaction.contract_name,
        assetPermalink: createPermalink(chainId, transaction.contract_address, transaction.token_id),
        priceInToken: paymentToken
            ? {
                  amount: scale10(transaction.trade_price, paymentToken?.decimals).toFixed(),
                  token: paymentToken,
              }
            : undefined,
        paymentToken,
        source: SourceType.NFTScan,
    }
}
