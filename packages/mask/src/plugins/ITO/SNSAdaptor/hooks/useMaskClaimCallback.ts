import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useMaskITO_Contract } from './useMaskITO_Contract.js'

export function useMaskClaimCallback() {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const MaskITO_Contract = useMaskITO_Contract(chainId)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    return useAsyncFn(async () => {
        if (!connection || !MaskITO_Contract) return

        const config = {
            from: account,
        }
        const tx = await encodeContractTransaction(MaskITO_Contract, MaskITO_Contract.methods.claim(), config)
        return connection.sendTransaction(tx)
    }, [account, chainId, MaskITO_Contract, connection])
}
