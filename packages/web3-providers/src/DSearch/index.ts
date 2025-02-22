import urlcat from 'urlcat'
import { compact, uniqWith } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    SearchResult,
    SearchResultType,
    DomainResult,
    FungibleTokenResult,
    NonFungibleTokenResult,
    SourceType,
    NonFungibleCollectionResult,
    EOAResult,
    attemptUntil,
    isSameAddress,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    ChainId as ChainIdEVM,
    isValidAddress as isValidAddressEVM,
    isZeroAddress as isZeroAddressEVM,
    isValidDomain as isValidDomainEVM,
} from '@masknet/web3-shared-evm'
import {
    isValidAddress as isValidAddressFlow,
    isZeroAddress as isZeroAddressFlow,
    isValidDomain as isValidDomainFlow,
} from '@masknet/web3-shared-flow'
import {
    isValidAddress as isValidAddressSolana,
    isZeroAddress as isZeroAddressSolana,
    isValidDomain as isValidDomainSolana,
} from '@masknet/web3-shared-solana'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { CoinGeckoSearchAPI } from '../CoinGecko/apis/DSearchAPI.js'
import { CoinMarketCapSearchAPI } from '../CoinMarketCap/apis/CoinMarketCapSearchAPI.js'
import { NFTScanSearchAPI, NFTScanCollectionSearchAPI } from '../NFTScan/index.js'
import type { DSearchBaseAPI } from '../types/DSearch.js'
import { getHandlers } from './rules.js'
import { DSEARCH_BASE_URL } from './constants.js'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import { ENS_API } from '../ENS/index.js'
import { CoinGeckoTrending_API } from '../CoinGecko/apis/CoinGecko.js'
import { RSS3API } from '../RSS3/index.js'
import { PlatformToChainIdMap } from '../RSS3/constants.js'

const CoinGeckoTrending = new CoinGeckoTrending_API()
const ENS = new ENS_API()
const ChainbaseDomain = new ChainbaseDomainAPI()

const isValidAddress = (address?: string): boolean => {
    return isValidAddressEVM(address) || isValidAddressFlow(address) || isValidAddressSolana(address)
}

const isZeroAddress = (address?: string): boolean => {
    return isZeroAddressEVM(address) || isZeroAddressFlow(address) || isZeroAddressSolana(address)
}

const isValidDomain = (domain?: string): boolean => {
    return isValidDomainEVM(domain) || isValidDomainFlow(domain) || isValidDomainSolana(domain)
}

const isValidHandle = (handler: string): boolean => {
    const suffix = handler.split('.').pop()
    if (!suffix) return false
    return [
        'avax',
        'csb',
        'bit',
        'eth',
        'lens',
        'bnb',
        'crypto',
        'nft',
        'x',
        'wallet',
        'bitcoin',
        'dao',
        '888',
        'zil',
        'blockchain',
    ].includes(suffix.toLowerCase())
}

export class DSearchAPI<ChainId = Web3Helper.ChainIdAll, SchemaType = Web3Helper.SchemaTypeAll>
    implements DSearchBaseAPI.Provider<ChainId, SchemaType, NetworkPluginID>
{
    private NFTScanClient = new NFTScanSearchAPI<ChainId, SchemaType>()
    private NFTScanCollectionClient = new NFTScanCollectionSearchAPI<ChainId, SchemaType>()
    private CoinGeckoClient = new CoinGeckoSearchAPI<ChainId, SchemaType>()
    private CoinMarketCapClient = new CoinMarketCapSearchAPI<ChainId, SchemaType>()
    private RSS3 = new RSS3API()

    private parseKeyword(keyword: string): { word: string; field?: string } {
        const words = keyword.split(':')
        if (words.length === 1) {
            return {
                word: words[0],
            }
        }
        return {
            word: words[1],
            field: words[0],
        }
    }

    private async searchDomain(domain: string): Promise<Array<DomainResult<ChainId>>> {
        // only EVM domains
        if (!isValidDomainEVM(domain)) return EMPTY_LIST

        const [address, chainId] = await attemptUntil(
            [
                () =>
                    ENS.lookup(ChainIdEVM.Mainnet, domain).then((x = '') => {
                        if (isZeroAddressEVM(address)) throw new Error(`No result for ${domain}`)
                        return [x, ChainIdEVM.Mainnet]
                    }),
                () =>
                    ChainbaseDomain.lookup(ChainIdEVM.Mainnet, domain).then((x = '') => {
                        if (!x || isZeroAddressEVM(address)) throw new Error(`No result for ${domain}`)
                        return [x, ChainIdEVM.Mainnet]
                    }),
                () => ChainbaseDomain.lookup(ChainIdEVM.BSC, domain).then((x = '') => [x, ChainIdEVM.BSC]),
            ],
            ['', ChainIdEVM.Mainnet],
        )
        if (!isValidAddressEVM(address) || isZeroAddressEVM(address)) return EMPTY_LIST

        return [
            {
                type: SearchResultType.Domain,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: chainId as ChainId,
                keyword: domain,
                domain,
                address,
            },
        ]
    }

    private async searchRSS3Handle(handle: string): Promise<Array<DomainResult<ChainId>>> {
        const profiles = await this.RSS3.getProfiles(handle)
        return profiles
            .filter((x) => x.handle === handle)
            .map((profile) => {
                const chainId = PlatformToChainIdMap[profile.network] as ChainId
                if (!chainId) console.error(`Not chain id configured for network ${profile.network}`)

                return {
                    type: SearchResultType.Domain,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    chainId,
                    keyword: handle,
                    domain: profile.handle,
                    address: profile.address,
                }
            })
    }

    private async searchRSS3NameService(handle: string): Promise<Array<DomainResult<ChainId>>> {
        const result = await this.RSS3.getNameService(handle)
        if (!result) return []
        return [
            {
                type: SearchResultType.Domain,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: result.chainId as ChainId,
                keyword: handle,
                domain: handle,
                address: result.address,
            },
        ]
    }

    private async searchAddress(address: string): Promise<Array<EOAResult<ChainId>>> {
        // only EVM address
        if (!isValidAddressEVM(address)) return EMPTY_LIST

        const [domain, chainId] = await attemptUntil(
            [
                () => ENS.reverse(ChainIdEVM.Mainnet, address).then((x) => [x, ChainIdEVM.Mainnet]),
                () => ChainbaseDomain.reverse(ChainIdEVM.Mainnet, address).then((x) => [x, ChainIdEVM.Mainnet]),
                () => ChainbaseDomain.reverse(ChainIdEVM.BSC, address).then((x) => [x, ChainIdEVM.BSC]),
            ],
            ['', ChainIdEVM.Mainnet],
        )

        if (!isValidDomainEVM(domain)) return EMPTY_LIST

        return [
            {
                type: SearchResultType.EOA,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: chainId as ChainId,
                keyword: address,
                domain,
                address,
            },
        ]
    }

    private async searchTokens() {
        const specificTokens = (
            await Promise.allSettled([
                fetchJSON<Array<FungibleTokenResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/fungible-tokens/specific-list.json'),
                ),
                fetchJSON<Array<NonFungibleTokenResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/non-fungible-tokens/specific-list.json'),
                ),
                fetchJSON<Array<NonFungibleCollectionResult<ChainId, SchemaType>>>(
                    urlcat(DSEARCH_BASE_URL, '/non-fungible-collections/specific-list.json'),
                ),
            ])
        )
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()

        const normalTokens = (
            await Promise.allSettled([
                this.NFTScanClient.get(),
                this.CoinGeckoClient.get(),
                this.CoinMarketCapClient.get(),
            ])
        )
            .map((v) => (v.status === 'fulfilled' && v.value ? v.value : []))
            .flat()

        return {
            specificTokens: compact<
                | FungibleTokenResult<ChainId, SchemaType>
                | NonFungibleTokenResult<ChainId, SchemaType>
                | NonFungibleCollectionResult<ChainId, SchemaType>
            >(
                specificTokens.map((x) =>
                    x.type === SearchResultType.FungibleToken ||
                    x.type === SearchResultType.NonFungibleToken ||
                    x.type === SearchResultType.NonFungibleCollection
                        ? x
                        : undefined,
                ),
            ),
            normalTokens: compact<
                | FungibleTokenResult<ChainId, SchemaType>
                | NonFungibleTokenResult<ChainId, SchemaType>
                | NonFungibleCollectionResult<ChainId, SchemaType>
            >(
                normalTokens.map((x) =>
                    x.type === SearchResultType.FungibleToken ||
                    x.type === SearchResultType.NonFungibleToken ||
                    x.type === SearchResultType.NonFungibleCollection
                        ? x
                        : undefined,
                ),
            ),
        }
    }

    private async searchTokenByAddress(address: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { specificTokens, normalTokens } = await this.searchTokens()

        const specificTokensFiltered = specificTokens
            .filter(
                (x) =>
                    isSameAddress(address, x.address) &&
                    (x.type === SearchResultType.FungibleToken ||
                        x.type === SearchResultType.NonFungibleToken ||
                        x.type === SearchResultType.NonFungibleCollection),
            )
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

        const normalTokensFiltered = normalTokens
            .filter(
                (x) =>
                    isSameAddress(address, x.address) &&
                    (x.type === SearchResultType.FungibleToken ||
                        x.type === SearchResultType.NonFungibleToken ||
                        x.type === SearchResultType.NonFungibleCollection),
            )
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

        if (specificTokensFiltered.length > 0) return [specificTokensFiltered[0]]

        if (normalTokensFiltered.length > 0) return [normalTokensFiltered[0]]

        const coinInfo = await CoinGeckoTrending.getCoinInfoByAddress(address)

        if (coinInfo?.id) {
            return [
                {
                    type: SearchResultType.FungibleToken,
                    pluginID: NetworkPluginID.PLUGIN_EVM,
                    chainId: coinInfo.chainId as ChainId,
                    id: coinInfo.id,
                    source: SourceType.CoinGecko,
                    name: coinInfo.name,
                    // FIXME: symbol is missing
                    symbol: coinInfo.name,
                    keyword: address,
                },
            ]
        }
        return EMPTY_LIST
    }

    private async searchTokenByHandler(
        tokens: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        >,
        name: string,
    ): Promise<
        Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        >
    > {
        let result: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        > = []

        if (name.length < 6) {
            result = tokens.filter((t) => t.symbol?.toLowerCase() === name.toLowerCase())
        }

        if (!result.length) {
            for (const { rules, type } of getHandlers<ChainId, SchemaType>()) {
                for (const rule of rules) {
                    if (!['token', 'twitter'].includes(rule.key)) continue

                    const filtered = tokens.filter((x) => (type ? type === x.type : true))
                    if (rule.type === 'exact') {
                        const item = filtered.find((x) => rule.filter?.(x, name, filtered))
                        if (item) result = [...result, { ...item, keyword: name }]
                    }
                    if (rule.type === 'fuzzy' && rule.fullSearch) {
                        const items = rule
                            .fullSearch<
                                | FungibleTokenResult<ChainId, SchemaType>
                                | NonFungibleTokenResult<ChainId, SchemaType>
                                | NonFungibleCollectionResult<ChainId, SchemaType>
                            >(name, filtered)
                            ?.map((x) => ({ ...x, keyword: name }))
                        if (items?.length) result = [...result, ...items]
                    }
                }
            }
        }
        return result.sort((a, b) => {
            if (
                a.rank &&
                a.rank < 200 &&
                a.type === SearchResultType.FungibleToken &&
                b.type !== SearchResultType.FungibleToken
            )
                return -1
            return (a.rank ?? 0) - (b.rank ?? 0)
        })
    }

    private async searchTokenByName(name: string): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const { specificTokens, normalTokens } = await this.searchTokens()

        const specificResult_ = await this.searchTokenByHandler(specificTokens, name)
        const normalResult = await this.searchTokenByHandler(normalTokens, name)

        const specificResult: Array<
            | FungibleTokenResult<ChainId, SchemaType>
            | NonFungibleTokenResult<ChainId, SchemaType>
            | NonFungibleCollectionResult<ChainId, SchemaType>
        > = ([] = specificResult_.map((x) => {
            const r = normalResult.find((y) => y.id === x.id && y.source === x.source)
            return { ...x, rank: r?.rank }
        }))

        return uniqWith(specificResult.concat(normalResult), (a, b) => a.id === b.id)
    }

    private async searchNonFungibleTokenByTwitterHandler(
        twitterHandler: string,
    ): Promise<Array<SearchResult<ChainId, SchemaType>>> {
        const collections = (await this.NFTScanCollectionClient.get())
            .filter((x) => x.collection?.socialLinks?.twitter?.toLowerCase().endsWith(twitterHandler.toLowerCase()))
            .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

        if (!collections[0]) return EMPTY_LIST

        return collections
    }

    /**
     * The entry point of DSearch
     * @param keyword
     * @returns
     */
    async search<T extends SearchResult<ChainId, SchemaType> = SearchResult<ChainId, SchemaType>>(
        keyword: string,
        type?: SearchResultType,
    ): Promise<T[]> {
        // #MASK or $MASK
        const [_, name = ''] = keyword.match(/[#$](\w+)/) ?? []
        if (name) return this.searchTokenByName(name) as Promise<T[]>

        // BoredApeYC or CryptoPunks nft twitter project
        if (type === SearchResultType.NonFungibleCollection)
            return this.searchNonFungibleTokenByTwitterHandler(keyword) as Promise<T[]>

        // token:MASK
        const { word, field } = this.parseKeyword(keyword)
        if (word && ['token', 'twitter'].includes(field ?? '')) return this.searchTokenByName(word) as Promise<T[]>

        // vitalik.lens, vitalik.bit, etc. including ENS BNB
        // Can't get .bit domain via RSS3 profile API.
        if (isValidHandle(keyword) && !keyword.endsWith('.bit')) {
            return this.searchRSS3Handle(keyword) as Promise<T[]>
        }
        if (keyword.endsWith('.bit')) {
            return this.searchRSS3NameService(keyword) as Promise<T[]>
        }

        // vitalik.eth
        if (isValidDomain(keyword)) return this.searchDomain(keyword) as Promise<T[]>

        // 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
        if (isValidAddress?.(keyword) && !isZeroAddress?.(keyword)) {
            const tokenList = await this.searchTokenByAddress(keyword)
            if (tokenList.length) return tokenList as T[]

            const addressList = await this.searchAddress(keyword)
            if (addressList.length) return addressList as T[]

            // TODO: query fungible token by coingecko
        }

        return EMPTY_LIST
    }
}
