import { mixin } from '@masknet/shared-base'
import { HubStateBaseClient, HubStateFungibleClient, HubStateNonFungibleClient } from '@masknet/web3-state'
import {
    CoinGeckoPriceSolana,
    MagicEden,
    SolanaFungible,
    SolanaNonFungible,
    NFTScanNonFungibleTokenSolana,
} from '@masknet/web3-providers'
import type { FungibleTokenAPI, NonFungibleTokenAPI, PriceAPI } from '@masknet/web3-providers/types'
import {
    attemptUntil,
    CurrencyType,
    GasOptionType,
    HubIndicator,
    HubOptions,
    Pageable,
    SourceType,
    Transaction,
} from '@masknet/web3-shared-base'
import { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-solana'
import type { SolanaHub } from './types.js'
import { Web3StateSettings } from '../../settings/index.js'

class HubFungibleClient extends HubStateFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        const options = this.getOptions(initial)

        // only the first page is available
        if ((options.indicator ?? 0) > 0) return []

        return this.getPredicateProviders<FungibleTokenAPI.Provider<ChainId, SchemaType> | PriceAPI.Provider<ChainId>>(
            {
                [SourceType.Solana]: SolanaFungible,
                [SourceType.CoinGecko]: CoinGeckoPriceSolana,
            },
            [SolanaFungible, CoinGeckoPriceSolana],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: HubOptions<ChainId, HubIndicator> | undefined) {
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId: initial?.chainId,
        })

        return attemptUntil(
            [
                () =>
                    Web3StateSettings.value.Token?.createFungibleToken?.(
                        initial?.chainId ?? ChainId.Mainnet,
                        address ?? '',
                    ),
                () => connection?.getFungibleToken?.(address ?? '', initial),
            ],
            undefined,
        )
    }
}

class HubNonFungibleClient extends HubStateNonFungibleClient<ChainId, SchemaType> {
    protected override getProviders(initial?: HubOptions<ChainId>) {
        return this.getPredicateProviders<NonFungibleTokenAPI.Provider<ChainId, SchemaType>>(
            {
                [SourceType.MagicEden]: MagicEden,
                [SourceType.Solana]: SolanaNonFungible,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenSolana,
            },
            [NFTScanNonFungibleTokenSolana, MagicEden, SolanaNonFungible],
            initial,
        )
    }
}

class Hub extends HubStateBaseClient<ChainId> implements SolanaHub {
    getGasOptions(chainId: ChainId, initial?: HubOptions<ChainId>): Promise<Record<GasOptionType, GasOption>> {
        throw new Error('Method not implemented.')
    }

    getTransactions(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}

export function createHub(
    chainId = ChainId.Mainnet,
    account = '',
    sourceType?: SourceType,
    currencyType?: CurrencyType,
) {
    return mixin(
        new Hub(chainId, account, sourceType, currencyType),
        new HubFungibleClient(chainId, account, sourceType, currencyType),
        new HubNonFungibleClient(chainId, account, sourceType, currencyType),
    )
}
