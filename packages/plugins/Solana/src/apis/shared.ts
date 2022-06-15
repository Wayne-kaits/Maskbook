import type { ChainId } from '@masknet/web3-shared-solana'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { NETWORK_ENDPOINTS } from '../constants'

export const SPL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID.toBase58()

interface RpcOptions {
    method: string
    params?: unknown[]
}

export interface RpcResponse<T> {
    jsonrpc: '2.0'
    result: T | null
}

export interface AccountInfo {
    data: [string, string] | object
    executable: boolean
    lamports: number
}

export interface SplToken {
    symbol: string
    name: string
    mint: string
    decimals: 3
    icon: string
}

export interface RaydiumTokenList {
    name: string
    timestamp: string
    version: {
        major: number
        minor: number
        patch: number
    }
    official: SplToken[]
    unOfficial: SplToken[]
}

export type GetAccountInfoResponse = RpcResponse<{ value: AccountInfo }>
export interface ProgramAccount {
    account: {
        data: {
            parsed: {
                info: {
                    isNative: false
                    mint: string
                    owner: string
                    state: string
                    tokenAmount: {
                        amount: string
                        decimals: number
                        uiAmount: number
                        uiAmountString: string
                    }
                }
            }
            program: 'spl-token'
            space: number
        }
        executable: boolean
        lamports: number
        owner: string
        rentEpoch: string
    }
    pubkey: string
}

export type GetProgramAccountsResponse = RpcResponse<ProgramAccount[]>

let id = 0

export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const endpoint = NETWORK_ENDPOINTS[chainId]
    id += 1
    const res = await globalThis.fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
            ...options,
            jsonrpc: '2.0',
            id,
        }),
    })
    const result = await res.json()
    if (result.error) throw new Error(result.message || 'Fails in requesting RPC')
    return result
}

export async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await globalThis.fetch(url)
    return res.json()
}
