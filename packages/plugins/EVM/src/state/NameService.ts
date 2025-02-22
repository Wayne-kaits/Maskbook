import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS_Resolver } from './NameService/ENS.js'
import { SpaceID_Resolver } from './NameService/SpaceID.js'
import { GraphQLResolver } from './NameService/GraphQL.js'
import { ThegraphResolver } from './NameService/Thegraph.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers(chainId?: ChainId) {
        return [new ENS_Resolver(), new SpaceID_Resolver(), new GraphQLResolver(), new ThegraphResolver()]
    }
}
