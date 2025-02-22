import { Web3ContextProvider, useNetworkContext } from '@masknet/web3-hooks-base'
import { MaskLightTheme } from '@masknet/theme'
import { ThemeProvider } from '@mui/material'
import type { CollectiblePayload } from '../types.js'
import { Collectible } from './Card/Collectible.js'
import { Context } from './Context/index.js'
import { SNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { SharedContextSettings } from '../context.js'

export interface PostInspectorProps {
    payload: CollectiblePayload
}

export function PostInspector(props: PostInspectorProps) {
    const token = props.payload
    const { pluginID } = useNetworkContext()

    return (
        <SNSAdaptorContext.Provider value={SharedContextSettings.value}>
            <ThemeProvider theme={MaskLightTheme}>
                <Context.Provider
                    initialState={{
                        parentPluginID: pluginID,
                        pluginID: token.pluginID,
                        chainId: token.chainId,
                        tokenId: token.tokenId,
                        tokenAddress: token.address,
                    }}>
                    <Web3ContextProvider value={{ pluginID: token.pluginID, chainId: token.chainId }}>
                        <Collectible />
                    </Web3ContextProvider>
                </Context.Provider>
            </ThemeProvider>
        </SNSAdaptorContext.Provider>
    )
}
