import { useAsyncRetry } from 'react-use'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { activatedSocialNetworkUI } from '../../../social-network'
import { usePersonas } from './usePersonas'
import { useWeb3Connection } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PluginNFTAvatarRPC } from '../messages'
import type { EnhanceableSite } from '@masknet/shared-base'

export function useTokenOwner(
    address: string,
    tokenId: string,
    pluginId: NetworkPluginID,
    chainId?: ChainId,
    account?: string,
) {
    const connection = useWeb3Connection<'all'>(pluginId, { account, chainId })
    return useAsyncRetry(async () => {
        if (!address || !tokenId || !connection) return
        const token = await connection.getNonFungibleToken(address, tokenId)
        return { owner: token?.metadata?.owner, name: token?.contract?.name, symbol: token?.contract?.symbol }
    }, [connection, tokenId, address])
}

export function useCheckTokenOwner(pluginId: NetworkPluginID, userId: string, owner: string) {
    const { value: persona, loading } = usePersonas(userId)
    const { value: storage, loading: loadingAddress } = useAsyncRetry(
        async () =>
            PluginNFTAvatarRPC.getAddress(activatedSocialNetworkUI.networkIdentifier as EnhanceableSite, userId),
        [userId],
    )

    return {
        loading: loading || loadingAddress,
        isOwner: Boolean(
            (storage?.address && isSameAddress(storage.address, owner) && pluginId === storage.networkPluginID) ||
                persona?.wallets.some((x) => isSameAddress(x.identity, owner)),
        ),
    }
}
