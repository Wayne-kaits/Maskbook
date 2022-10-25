import { useAsyncRetry } from 'react-use'
import { FungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ChainId, SchemaType, useTokenConstants } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'

export function useTrade(
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>,
) {
    const { chainId: targetChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { WNATIVE_ADDRESS } = useTokenConstants(targetChainId)

    // to mimic the same interface with other trade providers
    return useAsyncRetry(async () => {
        if (!inputToken || !outputToken) return false
        // none of the tokens is native token
        if (inputToken.schema !== SchemaType.Native && outputToken.schema !== SchemaType.Native) return false
        // none of the tokens is wrapped native token
        if (!isSameAddress(inputToken.address, WNATIVE_ADDRESS) && !isSameAddress(outputToken.address, WNATIVE_ADDRESS))
            return false
        return true
    }, [WNATIVE_ADDRESS, inputToken, outputToken])
}
