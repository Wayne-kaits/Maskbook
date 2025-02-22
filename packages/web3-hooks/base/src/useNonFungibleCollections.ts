import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, NetworkPluginID } from '@masknet/shared-base'
import { HubIndicator, NonFungibleCollection, pageableToIterator } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleCollections<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account, chainId: options?.chainId })
    const hub = useWeb3Hub(pluginID, options)

    return useAsyncRetry<
        Array<NonFungibleCollection<Web3Helper.ChainIdScope<S, T>, Web3Helper.SchemaTypeScope<S, T>>>
    >(async () => {
        if (!account || !hub) return []

        return asyncIteratorToArray(
            pageableToIterator(async (indicator?: HubIndicator) => {
                if (!hub.getNonFungibleCollectionsByOwner) return
                return hub.getNonFungibleCollectionsByOwner(account, {
                    indicator,
                    size: 50,
                    ...options,
                })
            }),
        )
    }, [account, hub, chainId, JSON.stringify(options)])
}
