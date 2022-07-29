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
} from './types'

interface EventOptions {
    filter?: object
    fromBlock?: BlockType
    topics?: string[]
}

export type AllConditionsStopped = ContractEventLog<{
    flag: boolean
    0: boolean
}>
export type ConditionCreated = ContractEventLog<{
    oracleConditionId: string
    conditionId: string
    timestamp: string
    0: string
    1: string
    2: string
}>
export type ConditionResolved = ContractEventLog<{
    oracleConditionId: string
    conditionId: string
    outcomeWin: string
    state: string
    amountForLp: string
    0: string
    1: string
    2: string
    3: string
    4: string
}>
export type ConditionShifted = ContractEventLog<{
    conditionId: string
    newTimestamp: string
    0: string
    1: string
}>
export type ConditionStopped = ContractEventLog<{
    conditionId: string
    flag: boolean
    0: string
    1: boolean
}>
export type LpChanged = ContractEventLog<{
    newLp: string
    0: string
}>
export type MaintainerUpdated = ContractEventLog<{
    maintainer: string
    active: boolean
    0: string
    1: boolean
}>
export type MaxBanksRatioChanged = ContractEventLog<{
    newRatio: string
    0: string
}>
export type OracleAdded = ContractEventLog<{
    newOracle: string
    0: string
}>
export type OracleRenounced = ContractEventLog<{
    oracle: string
    0: string
}>
export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>

export interface AzuroCore extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): AzuroCore
    clone(): AzuroCore
    methods: {
        LP(): NonPayableTransactionObject<string>

        addMaintainer(maintainer: string, active: boolean): NonPayableTransactionObject<void>

        allConditionsStopped(): NonPayableTransactionObject<boolean>

        bets(arg0: number | string | BN): NonPayableTransactionObject<{
            conditionId: string
            amount: string
            outcome: string
            createdAt: string
            odds: string
            payed: boolean
            0: string
            1: string
            2: string
            3: string
            4: string
            5: boolean
        }>

        calculateOdds(
            conditionId: number | string | BN,
            amount: number | string | BN,
            outcome: number | string | BN,
        ): NonPayableTransactionObject<string>

        cancelByMaintainer(conditionId: number | string | BN): NonPayableTransactionObject<void>

        cancelByOracle(oracleConditionId: number | string | BN): NonPayableTransactionObject<void>

        ceil(a: number | string | BN, m: number | string | BN): NonPayableTransactionObject<string>

        changeMaxBanksRatio(newRatio: number | string | BN): NonPayableTransactionObject<void>

        conditions(arg0: number | string | BN): NonPayableTransactionObject<{
            reinforcement: string
            margin: string
            ipfsHash: string
            scopeId: string
            outcomeWin: string
            timestamp: string
            state: string
            leaf: string
            0: string
            1: string
            2: string
            3: string
            4: string
            5: string
            6: string
            7: string
        }>

        createCondition(
            oracleCondId: number | string | BN,
            scopeId: number | string | BN,
            odds: (number | string | BN)[],
            outcomes: (number | string | BN)[],
            timestamp: number | string | BN,
            ipfsHash: string | number[],
        ): NonPayableTransactionObject<void>

        defaultMargin(): NonPayableTransactionObject<string>

        defaultReinforcement(): NonPayableTransactionObject<string>

        getBetInfo(betId: number | string | BN): NonPayableTransactionObject<{
            amount: string
            odds: string
            createdAt: string
            0: string
            1: string
            2: string
        }>

        getCondition(
            conditionId: number | string | BN,
        ): NonPayableTransactionObject<
            [string[], string[], string[], string, string, string, string[], string, string, string, string, string]
        >

        getConditionFunds(conditionId: number | string | BN): NonPayableTransactionObject<string[]>

        getConditionReinforcement(conditionId: number | string | BN): NonPayableTransactionObject<string>

        getLockedPayout(): NonPayableTransactionObject<string>

        getMargin(outcomeId: number | string | BN): NonPayableTransactionObject<string>

        getOddsFromBanks(
            fund1Bank: number | string | BN,
            fund2Bank: number | string | BN,
            amount: number | string | BN,
            outcomeIndex: number | string | BN,
            margin: number | string | BN,
            multiplier: number | string | BN,
        ): NonPayableTransactionObject<string>

        getReinforcement(outcomeId: number | string | BN): NonPayableTransactionObject<string>

        initialize(
            reinforcement: number | string | BN,
            oracle: string,
            margin: number | string | BN,
        ): NonPayableTransactionObject<void>

        isOracle(oracle: string): NonPayableTransactionObject<boolean>

        isOutComeCorrect(
            conditionId: number | string | BN,
            outcome: number | string | BN,
        ): NonPayableTransactionObject<boolean>

        lastConditionId(): NonPayableTransactionObject<string>

        maintainers(arg0: string): NonPayableTransactionObject<boolean>

        marginAdjustedOdds(
            odds: number | string | BN,
            marginality: number | string | BN,
            multiplier: number | string | BN,
        ): NonPayableTransactionObject<string>

        maxBanksRatio(): NonPayableTransactionObject<string>

        multiplier(): NonPayableTransactionObject<string>

        oracleConditionIds(arg0: string, arg1: number | string | BN): NonPayableTransactionObject<string>

        oracles(arg0: string): NonPayableTransactionObject<boolean>

        owner(): NonPayableTransactionObject<string>

        putBet(
            conditionId: number | string | BN,
            tokenId: number | string | BN,
            amount: number | string | BN,
            outcome: number | string | BN,
            minOdds: number | string | BN,
        ): NonPayableTransactionObject<{
            0: string
            1: string
            2: string
        }>

        renounceOracle(oracle: string): NonPayableTransactionObject<void>

        renounceOwnership(): NonPayableTransactionObject<void>

        resolveCondition(
            oracleCondId: number | string | BN,
            outcomeWin: number | string | BN,
        ): NonPayableTransactionObject<void>

        resolvePayout(tokenId: number | string | BN): NonPayableTransactionObject<{
            success: boolean
            amount: string
            0: boolean
            1: string
        }>

        setLp(lp: string): NonPayableTransactionObject<void>

        setOracle(oracle: string): NonPayableTransactionObject<void>

        shift(conditionId: number | string | BN, newTimestamp: number | string | BN): NonPayableTransactionObject<void>

        sqrt(x: number | string | BN): NonPayableTransactionObject<string>

        stopAllConditions(flag: boolean): NonPayableTransactionObject<void>

        stopCondition(conditionId: number | string | BN, flag: boolean): NonPayableTransactionObject<void>

        totalLockedPayout(): NonPayableTransactionObject<string>

        transferOwnership(newOwner: string): NonPayableTransactionObject<void>

        updateMargins(data: (number | string | BN)[]): NonPayableTransactionObject<void>

        updateReinforcements(data: (number | string | BN)[]): NonPayableTransactionObject<void>

        viewPayout(tokenId: number | string | BN): NonPayableTransactionObject<{
            success: boolean
            amount: string
            0: boolean
            1: string
        }>
    }
    events: {
        AllConditionsStopped(cb?: Callback<AllConditionsStopped>): EventEmitter
        AllConditionsStopped(options?: EventOptions, cb?: Callback<AllConditionsStopped>): EventEmitter

        ConditionCreated(cb?: Callback<ConditionCreated>): EventEmitter
        ConditionCreated(options?: EventOptions, cb?: Callback<ConditionCreated>): EventEmitter

        ConditionResolved(cb?: Callback<ConditionResolved>): EventEmitter
        ConditionResolved(options?: EventOptions, cb?: Callback<ConditionResolved>): EventEmitter

        ConditionShifted(cb?: Callback<ConditionShifted>): EventEmitter
        ConditionShifted(options?: EventOptions, cb?: Callback<ConditionShifted>): EventEmitter

        ConditionStopped(cb?: Callback<ConditionStopped>): EventEmitter
        ConditionStopped(options?: EventOptions, cb?: Callback<ConditionStopped>): EventEmitter

        LpChanged(cb?: Callback<LpChanged>): EventEmitter
        LpChanged(options?: EventOptions, cb?: Callback<LpChanged>): EventEmitter

        MaintainerUpdated(cb?: Callback<MaintainerUpdated>): EventEmitter
        MaintainerUpdated(options?: EventOptions, cb?: Callback<MaintainerUpdated>): EventEmitter

        MaxBanksRatioChanged(cb?: Callback<MaxBanksRatioChanged>): EventEmitter
        MaxBanksRatioChanged(options?: EventOptions, cb?: Callback<MaxBanksRatioChanged>): EventEmitter

        OracleAdded(cb?: Callback<OracleAdded>): EventEmitter
        OracleAdded(options?: EventOptions, cb?: Callback<OracleAdded>): EventEmitter

        OracleRenounced(cb?: Callback<OracleRenounced>): EventEmitter
        OracleRenounced(options?: EventOptions, cb?: Callback<OracleRenounced>): EventEmitter

        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'AllConditionsStopped', cb: Callback<AllConditionsStopped>): void
    once(event: 'AllConditionsStopped', options: EventOptions, cb: Callback<AllConditionsStopped>): void

    once(event: 'ConditionCreated', cb: Callback<ConditionCreated>): void
    once(event: 'ConditionCreated', options: EventOptions, cb: Callback<ConditionCreated>): void

    once(event: 'ConditionResolved', cb: Callback<ConditionResolved>): void
    once(event: 'ConditionResolved', options: EventOptions, cb: Callback<ConditionResolved>): void

    once(event: 'ConditionShifted', cb: Callback<ConditionShifted>): void
    once(event: 'ConditionShifted', options: EventOptions, cb: Callback<ConditionShifted>): void

    once(event: 'ConditionStopped', cb: Callback<ConditionStopped>): void
    once(event: 'ConditionStopped', options: EventOptions, cb: Callback<ConditionStopped>): void

    once(event: 'LpChanged', cb: Callback<LpChanged>): void
    once(event: 'LpChanged', options: EventOptions, cb: Callback<LpChanged>): void

    once(event: 'MaintainerUpdated', cb: Callback<MaintainerUpdated>): void
    once(event: 'MaintainerUpdated', options: EventOptions, cb: Callback<MaintainerUpdated>): void

    once(event: 'MaxBanksRatioChanged', cb: Callback<MaxBanksRatioChanged>): void
    once(event: 'MaxBanksRatioChanged', options: EventOptions, cb: Callback<MaxBanksRatioChanged>): void

    once(event: 'OracleAdded', cb: Callback<OracleAdded>): void
    once(event: 'OracleAdded', options: EventOptions, cb: Callback<OracleAdded>): void

    once(event: 'OracleRenounced', cb: Callback<OracleRenounced>): void
    once(event: 'OracleRenounced', options: EventOptions, cb: Callback<OracleRenounced>): void

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void
}
