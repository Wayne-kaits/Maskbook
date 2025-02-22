import urlcat from 'urlcat'
import { unionWith } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    GasOptionType,
    Transaction,
    createPageable,
    HubOptions,
    createIndicator,
    Pageable,
    isSameAddress,
    toFixed,
} from '@masknet/web3-shared-base'
import { ChainId, formatGweiToWei, getDeBankConstants, SchemaType, GasOption } from '@masknet/web3-shared-evm'
import { formatAssets, formatTransactions, resolveDeBankAssetId, resolveDeBankAssetIdReversed } from './helpers.js'
import type { WalletTokenRecord, GasPriceDictResponse, HistoryRecord } from './types.js'
import { fetchJSON, getNativeAssets } from '../entry-helpers.js'
import type { FungibleTokenAPI, HistoryAPI, GasOptionAPI } from '../entry-types.js'

const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

/**
 * Debank's data might be outdated, like gas price for aurora which requires 1 Gwei at least
 * https://twitter.com/AlexAuroraDev/status/1490353255817302016
 * Once debank fixes it, we will remove this modifier.
 */
function gasModifier(gasDict: GasPriceDictResponse, chain: string) {
    if (chain === getDeBankConstants(ChainId.Aurora).CHAIN_ID) {
        ;(['fast', 'normal', 'slow'] as const).forEach((fieldKey) => {
            const field = gasDict.data[fieldKey]
            field.price = Math.max(field.price, formatGweiToWei(1).toNumber())
        })
    }
    return gasDict
}

export class DeBankAPI
    implements
        FungibleTokenAPI.Provider<ChainId, SchemaType>,
        HistoryAPI.Provider<ChainId, SchemaType>,
        GasOptionAPI.Provider<ChainId, GasOption>
{
    async getGasOptions(chainId: ChainId): Promise<Record<GasOptionType, GasOption>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) throw new Error('Failed to get gas price.')

        const result = await fetchJSON<GasPriceDictResponse>(
            urlcat(DEBANK_OPEN_API, '/v1/wallet/gas_market', { chain_id: CHAIN_ID }),
        )
        if (result.error_code !== 0) throw new Error('Failed to get gas price.')

        const responseModified = gasModifier(result, CHAIN_ID)
        return {
            [GasOptionType.FAST]: {
                estimatedSeconds: responseModified.data.fast.estimated_seconds || 15,
                suggestedMaxFeePerGas: toFixed(responseModified.data.fast.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.NORMAL]: {
                estimatedSeconds: responseModified.data.normal.estimated_seconds || 30,
                suggestedMaxFeePerGas: toFixed(responseModified.data.normal.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
            [GasOptionType.SLOW]: {
                estimatedSeconds: responseModified.data.slow.estimated_seconds || 60,
                suggestedMaxFeePerGas: toFixed(responseModified.data.slow.price),
                suggestedMaxPriorityFeePerGas: '0',
            },
        }
    }

    async getAssets(address: string, options?: HubOptions<ChainId>) {
        const result = await fetchJSON<WalletTokenRecord[] | undefined>(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_token_list', {
                id: address,
                is_all: false,
            }),
        )
        return createPageable(
            unionWith(
                formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,

                        // rename bsc to bnb
                        id: resolveDeBankAssetId(x.id),
                        chain: resolveDeBankAssetId(x.chain),
                        // prefix ARETH
                        symbol: x.chain === 'arb' && x.symbol === 'ETH' ? 'ARETH' : x.symbol,
                        logo_url:
                            x.chain === 'arb' && x.symbol === 'ETH'
                                ? 'https://assets.debank.com/static/media/arbitrum.8e326f58.svg'
                                : x.logo_url,
                    })),
                ),
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const { CHAIN_ID = '' } = getDeBankConstants(chainId)
        if (!CHAIN_ID) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const result = await fetchJSON<HistoryRecord>(
            `${DEBANK_OPEN_API}/v1/user/history_list?id=${address.toLowerCase()}&chain_id=${resolveDeBankAssetIdReversed(
                CHAIN_ID,
            )}`,
        )
        const transactions = formatTransactions(chainId, result)
        return createPageable(transactions, createIndicator(indicator))
    }
}
