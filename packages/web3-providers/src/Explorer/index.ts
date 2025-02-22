import urlcat from 'urlcat'
import { ChainId, ExplorerURL } from '@masknet/web3-shared-evm'
import type { Transaction } from './types.js'
import { toTransaction } from './helpers.js'
import type { ExplorerAPI } from '../entry-types.js'
import { fetchJSON } from '../entry-helpers.js'

export class NativeExplorerAPI implements ExplorerAPI.Provider {
    async getLatestTransactions(
        chainId: ChainId,
        account: string,
        { offset = 10 }: ExplorerAPI.Options = {},
    ): Promise<ExplorerAPI.Transaction[]> {
        const { key, url } = ExplorerURL.from(chainId)
        const { result: transactions = [] } = await fetchJSON<{
            message: string
            result?: Transaction[]
            status: '0' | '1'
        }>(
            urlcat(url, {
                module: 'account',
                action: 'txlist',
                address: account.toLowerCase(),
                startBlock: 0,
                endblock: 999999999999,
                page: 1,
                offset,
                sort: 'desc',
                apikey: key,
            }),
        )
        return transactions.map(toTransaction)
    }
}
