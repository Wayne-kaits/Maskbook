import { useEffect, useMemo } from 'react'
import { HashRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, StyledEngineProvider } from '@mui/material'
import {
    CustomSnackbarProvider,
    applyMaskColorVars,
    DashboardDarkTheme,
    DashboardLightTheme,
    useSystemPreferencePalette,
    DialogStackingProvider,
} from '@masknet/theme'
import { LogHubBaseAPI } from '@masknet/web3-providers/types'
import { I18NextProviderHMR, SharedContextProvider, LoggerContextProvider } from '@masknet/shared'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { createInjectHooksRenderer, useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { EnvironmentContextProvider, Web3ContextProvider } from '@masknet/web3-hooks-base'
import { i18NextInstance, NetworkPluginID, queryRemoteI18NBundle } from '@masknet/shared-base'

import '../utils/kv-storage.js'

import { Pages } from '../pages/routes.js'
import { useAppearance, useLogSettings } from '../pages/Personas/api.js'
import { PersonaContext } from '../pages/Personas/hooks/usePersonaContext.js'
import { Services } from '../API.js'

const PluginRender = createInjectHooksRenderer(useActivatedPluginsDashboard, (x) => x.GlobalInjection)

const web3ContextType = { pluginID: NetworkPluginID.PLUGIN_EVM }
export default function DashboardRoot() {
    useEffect(queryRemoteI18NBundle(Services.Helper.queryRemoteI18NBundle), [])

    // #region theme
    const appearance = useAppearance()
    const loggerId = useLogSettings()
    const logContext = useMemo(() => ({ platform: LogHubBaseAPI.Platform.Dashboard, loggerId }), [loggerId])
    const mode = useSystemPreferencePalette()
    const theme = {
        dark: DashboardDarkTheme,
        light: DashboardLightTheme,
        default: mode === 'dark' ? DashboardDarkTheme : DashboardLightTheme,
    }[appearance]

    applyMaskColorVars(document.body, appearance === 'default' ? mode : appearance)
    // #endregion

    return (
        <EnvironmentContextProvider value={web3ContextType}>
            <Web3ContextProvider value={web3ContextType}>
                <I18NextProviderHMR i18n={i18NextInstance}>
                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={theme}>
                            <LoggerContextProvider value={logContext}>
                                <DialogStackingProvider>
                                    <PersonaContext.Provider>
                                        <ErrorBoundary>
                                            <CssBaseline />
                                            <CustomSnackbarProvider>
                                                <SharedContextProvider>
                                                    <HashRouter>
                                                        <Pages />
                                                    </HashRouter>
                                                    <PluginRender />
                                                </SharedContextProvider>
                                            </CustomSnackbarProvider>
                                        </ErrorBoundary>
                                    </PersonaContext.Provider>
                                </DialogStackingProvider>
                            </LoggerContextProvider>
                        </ThemeProvider>
                    </StyledEngineProvider>
                </I18NextProviderHMR>
            </Web3ContextProvider>
        </EnvironmentContextProvider>
    )
}
