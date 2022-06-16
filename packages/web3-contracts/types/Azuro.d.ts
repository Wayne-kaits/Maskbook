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

export type Approval = ContractEventLog<{
    owner: string
    approved: string
    tokenId: string
    0: string
    1: string
    2: string
}>
export type ApprovalForAll = ContractEventLog<{
    owner: string
    operator: string
    approved: boolean
    0: string
    1: string
    2: boolean
}>
export type AzuroBetChanged = ContractEventLog<{
    newAzuroBet: string
    0: string
}>
export type BetterWin = ContractEventLog<{
    better: string
    tokenId: string
    amount: string
    0: string
    1: string
    2: string
}>
export type DaoRewardChanged = ContractEventLog<{
    newDaoFee: string
    0: string
}>
export type LiquidityAdded = ContractEventLog<{
    account: string
    amount: string
    leaf: string
    0: string
    1: string
    2: string
}>
export type LiquidityRemoved = ContractEventLog<{
    account: string
    amount: string
    0: string
    1: string
}>
export type LiquidityRequested = ContractEventLog<{
    requestWallet: string
    requestedValueLp: string
    0: string
    1: string
}>
export type MinDepoChanged = ContractEventLog<{
    newMinDepo: string
    0: string
}>
export type NewBet = ContractEventLog<{
    owner: string
    betId: string
    conditionId: string
    outcomeId: string
    amount: string
    odds: string
    fund1: string
    fund2: string
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    7: string
}>
export type OracleRewardChanged = ContractEventLog<{
    newOracleFee: string
    0: string
}>
export type OwnershipTransferred = ContractEventLog<{
    previousOwner: string
    newOwner: string
    0: string
    1: string
}>
export type PeriodChanged = ContractEventLog<{
    newPeriod: string
    0: string
}>
export type Transfer = ContractEventLog<{
    from: string
    to: string
    tokenId: string
    0: string
    1: string
    2: string
}>
export type WithdrawTimeoutChanged = ContractEventLog<{
    newWithdrawTimeout: string
    0: string
}>

export interface Azuro extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): Azuro
    clone(): Azuro
    methods: {
        addLiquidity(amount: number | string | BN): NonPayableTransactionObject<void>

        addReserve(
            initReserve: number | string | BN,
            profitReserve: number | string | BN,
            leaf: number | string | BN,
        ): NonPayableTransactionObject<void>

        approve(to: string, tokenId: number | string | BN): NonPayableTransactionObject<void>

        azuroBet(): NonPayableTransactionObject<string>

        balanceOf(owner: string): NonPayableTransactionObject<string>

        bet(
            conditionId: number | string | BN,
            amount: number | string | BN,
            outcomeId: number | string | BN,
            deadline: number | string | BN,
            minOdds: number | string | BN,
        ): NonPayableTransactionObject<string>

        changeAzuroBet(newAzuroBet: string): NonPayableTransactionObject<void>

        changeCore(newCore: string): NonPayableTransactionObject<void>

        changeDaoReward(newDaoFee: number | string | BN): NonPayableTransactionObject<void>

        changeMinDepo(newMinDepo: number | string | BN): NonPayableTransactionObject<void>

        changeOracleReward(newOracleFee: number | string | BN): NonPayableTransactionObject<void>

        changeWithdrawTimeout(newWithdrawTimeout: number | string | BN): NonPayableTransactionObject<void>

        claimDaoReward(): NonPayableTransactionObject<void>

        core(): NonPayableTransactionObject<string>

        daoFee(): NonPayableTransactionObject<string>

        getApproved(tokenId: number | string | BN): NonPayableTransactionObject<string>

        getFeeMultiplier(): NonPayableTransactionObject<string>

        getLeaf(): NonPayableTransactionObject<string>

        getLeavesAmount(
            node: number | string | BN,
            begin: number | string | BN,
            end: number | string | BN,
            l: number | string | BN,
            r: number | string | BN,
        ): NonPayableTransactionObject<string>

        getOracleFee(): NonPayableTransactionObject<string>

        getParent(fromNumber: number | string | BN): NonPayableTransactionObject<string>

        getPossibilityOfReinforcement(reinforcementAmount: number | string | BN): NonPayableTransactionObject<boolean>

        getReserve(): NonPayableTransactionObject<string>

        initialize(token_: string, azuroBetAddress: string): NonPayableTransactionObject<void>

        isApprovedForAll(owner: string, operator: string): NonPayableTransactionObject<boolean>

        lockReserve(amount: number | string | BN): NonPayableTransactionObject<void>

        lockedLiquidity(): NonPayableTransactionObject<string>

        minDepo(): NonPayableTransactionObject<string>

        multiplier(): NonPayableTransactionObject<string>

        name(): NonPayableTransactionObject<string>

        nextNode(): NonPayableTransactionObject<string>

        nodeWithdrawView(leaf: number | string | BN): NonPayableTransactionObject<string>

        oracleFee(): NonPayableTransactionObject<string>

        owner(): NonPayableTransactionObject<string>

        ownerOf(tokenId: number | string | BN): NonPayableTransactionObject<string>

        reinforcementAbility(): NonPayableTransactionObject<string>

        renounceOwnership(): NonPayableTransactionObject<void>

        'safeTransferFrom(address,address,uint256)'(
            from: string,
            to: string,
            tokenId: number | string | BN,
        ): NonPayableTransactionObject<void>

        'safeTransferFrom(address,address,uint256,bytes)'(
            from: string,
            to: string,
            tokenId: number | string | BN,
            _data: string | number[],
        ): NonPayableTransactionObject<void>

        sendOracleReward(oracle: string, amount: number | string | BN): NonPayableTransactionObject<void>

        setApprovalForAll(operator: string, approved: boolean): NonPayableTransactionObject<void>

        supportsInterface(interfaceId: string | number[]): NonPayableTransactionObject<boolean>

        symbol(): NonPayableTransactionObject<string>

        token(): NonPayableTransactionObject<string>

        tokenByIndex(index: number | string | BN): NonPayableTransactionObject<string>

        tokenOfOwnerByIndex(owner: string, index: number | string | BN): NonPayableTransactionObject<string>

        tokenURI(tokenId: number | string | BN): NonPayableTransactionObject<string>

        totalDaoRewards(): NonPayableTransactionObject<string>

        totalSupply(): NonPayableTransactionObject<string>

        transferFrom(from: string, to: string, tokenId: number | string | BN): NonPayableTransactionObject<void>

        transferOwnership(newOwner: string): NonPayableTransactionObject<void>

        treeNode(arg0: number | string | BN): NonPayableTransactionObject<{
            updateId: string
            amount: string
            0: string
            1: string
        }>

        updateId(): NonPayableTransactionObject<string>

        viewPayout(tokenId: number | string | BN): NonPayableTransactionObject<{
            0: boolean
            1: string
        }>

        withdrawLiquidity(
            depNum: number | string | BN,
            percent: number | string | BN,
        ): NonPayableTransactionObject<void>

        withdrawPayout(tokenId: number | string | BN): NonPayableTransactionObject<void>

        withdrawTimeout(): NonPayableTransactionObject<string>

        withdrawals(arg0: number | string | BN): NonPayableTransactionObject<string>
    }
    events: {
        Approval(cb?: Callback<Approval>): EventEmitter
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter

        ApprovalForAll(cb?: Callback<ApprovalForAll>): EventEmitter
        ApprovalForAll(options?: EventOptions, cb?: Callback<ApprovalForAll>): EventEmitter

        AzuroBetChanged(cb?: Callback<AzuroBetChanged>): EventEmitter
        AzuroBetChanged(options?: EventOptions, cb?: Callback<AzuroBetChanged>): EventEmitter

        BetterWin(cb?: Callback<BetterWin>): EventEmitter
        BetterWin(options?: EventOptions, cb?: Callback<BetterWin>): EventEmitter

        DaoRewardChanged(cb?: Callback<DaoRewardChanged>): EventEmitter
        DaoRewardChanged(options?: EventOptions, cb?: Callback<DaoRewardChanged>): EventEmitter

        LiquidityAdded(cb?: Callback<LiquidityAdded>): EventEmitter
        LiquidityAdded(options?: EventOptions, cb?: Callback<LiquidityAdded>): EventEmitter

        LiquidityRemoved(cb?: Callback<LiquidityRemoved>): EventEmitter
        LiquidityRemoved(options?: EventOptions, cb?: Callback<LiquidityRemoved>): EventEmitter

        LiquidityRequested(cb?: Callback<LiquidityRequested>): EventEmitter
        LiquidityRequested(options?: EventOptions, cb?: Callback<LiquidityRequested>): EventEmitter

        MinDepoChanged(cb?: Callback<MinDepoChanged>): EventEmitter
        MinDepoChanged(options?: EventOptions, cb?: Callback<MinDepoChanged>): EventEmitter

        NewBet(cb?: Callback<NewBet>): EventEmitter
        NewBet(options?: EventOptions, cb?: Callback<NewBet>): EventEmitter

        OracleRewardChanged(cb?: Callback<OracleRewardChanged>): EventEmitter
        OracleRewardChanged(options?: EventOptions, cb?: Callback<OracleRewardChanged>): EventEmitter

        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter

        PeriodChanged(cb?: Callback<PeriodChanged>): EventEmitter
        PeriodChanged(options?: EventOptions, cb?: Callback<PeriodChanged>): EventEmitter

        Transfer(cb?: Callback<Transfer>): EventEmitter
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter

        WithdrawTimeoutChanged(cb?: Callback<WithdrawTimeoutChanged>): EventEmitter
        WithdrawTimeoutChanged(options?: EventOptions, cb?: Callback<WithdrawTimeoutChanged>): EventEmitter

        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter
    }

    once(event: 'Approval', cb: Callback<Approval>): void
    once(event: 'Approval', options: EventOptions, cb: Callback<Approval>): void

    once(event: 'ApprovalForAll', cb: Callback<ApprovalForAll>): void
    once(event: 'ApprovalForAll', options: EventOptions, cb: Callback<ApprovalForAll>): void

    once(event: 'AzuroBetChanged', cb: Callback<AzuroBetChanged>): void
    once(event: 'AzuroBetChanged', options: EventOptions, cb: Callback<AzuroBetChanged>): void

    once(event: 'BetterWin', cb: Callback<BetterWin>): void
    once(event: 'BetterWin', options: EventOptions, cb: Callback<BetterWin>): void

    once(event: 'DaoRewardChanged', cb: Callback<DaoRewardChanged>): void
    once(event: 'DaoRewardChanged', options: EventOptions, cb: Callback<DaoRewardChanged>): void

    once(event: 'LiquidityAdded', cb: Callback<LiquidityAdded>): void
    once(event: 'LiquidityAdded', options: EventOptions, cb: Callback<LiquidityAdded>): void

    once(event: 'LiquidityRemoved', cb: Callback<LiquidityRemoved>): void
    once(event: 'LiquidityRemoved', options: EventOptions, cb: Callback<LiquidityRemoved>): void

    once(event: 'LiquidityRequested', cb: Callback<LiquidityRequested>): void
    once(event: 'LiquidityRequested', options: EventOptions, cb: Callback<LiquidityRequested>): void

    once(event: 'MinDepoChanged', cb: Callback<MinDepoChanged>): void
    once(event: 'MinDepoChanged', options: EventOptions, cb: Callback<MinDepoChanged>): void

    once(event: 'NewBet', cb: Callback<NewBet>): void
    once(event: 'NewBet', options: EventOptions, cb: Callback<NewBet>): void

    once(event: 'OracleRewardChanged', cb: Callback<OracleRewardChanged>): void
    once(event: 'OracleRewardChanged', options: EventOptions, cb: Callback<OracleRewardChanged>): void

    once(event: 'OwnershipTransferred', cb: Callback<OwnershipTransferred>): void
    once(event: 'OwnershipTransferred', options: EventOptions, cb: Callback<OwnershipTransferred>): void

    once(event: 'PeriodChanged', cb: Callback<PeriodChanged>): void
    once(event: 'PeriodChanged', options: EventOptions, cb: Callback<PeriodChanged>): void

    once(event: 'Transfer', cb: Callback<Transfer>): void
    once(event: 'Transfer', options: EventOptions, cb: Callback<Transfer>): void

    once(event: 'WithdrawTimeoutChanged', cb: Callback<WithdrawTimeoutChanged>): void
    once(event: 'WithdrawTimeoutChanged', options: EventOptions, cb: Callback<WithdrawTimeoutChanged>): void
}
