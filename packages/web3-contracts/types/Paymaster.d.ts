/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from 'bn.js'
import { ContractOptions } from 'web3-eth-contract'
import { EventLog } from 'web3-core'
import { EventEmitter } from 'events'
import {
    Callback,
    PayableTransactionObject,
    NonPayableTransactionObject,
    BlockType,
    ContractEventLog,
    BaseContract,
} from './types.js'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export interface Paymaster extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): Paymaster
    clone(): Paymaster
    methods: {
        postOp(
            mode: number | string | BN,
            context: string | number[],
            actualGasCost: number | string | BN,
        ): NonPayableTransactionObject<void>

        validatePaymasterUserOp(
            userOp: [
                string,
                number | string | BN,
                string | number[],
                string | number[],
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                number | string | BN,
                string,
                string | number[],
                string | number[],
            ],
            requestId: string | number[],
            maxCost: number | string | BN,
        ): NonPayableTransactionObject<string>
    }
    events: {
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }
}
