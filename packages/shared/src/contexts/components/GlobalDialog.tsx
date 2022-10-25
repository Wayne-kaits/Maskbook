import {
    I18NStringField,
    PluginI18NFieldRender,
    useActivatedPluginsSNSAdaptor,
    useAvailablePlugins,
} from '@masknet/plugin-infra/content-script'
import { useActivatedPluginsDashboard } from '@masknet/plugin-infra/dashboard'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, PluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { ComponentType } from 'react'
import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'

export interface GlobalDialogProps {
    kind?: 'page' | 'sns'
}

export function GlobalDialog({ kind = 'sns' }: GlobalDialogProps) {
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const dashboardPlugins = useActivatedPluginsDashboard()
    const displayPlugins = useAvailablePlugins(kind === 'sns' ? activatedPlugins : dashboardPlugins, (plugins) => {
        return plugins.flatMap((x) => x.GlobalDialogContents?.map((y) => ({ ...y, pluginID: x.ID })) ?? EMPTY_LIST)
    })

    const initialEntries = displayPlugins.map((plugin) => plugin.path)

    if (!initialEntries.length) return null
    return (
        <MemoryRouter initialEntries={initialEntries}>
            <GlobalDialogUI routes={displayPlugins} />
        </MemoryRouter>
    )
}

interface CustomRoute {
    ID: PluginID
    label?: I18NStringField
    path: string
    UI: {
        DialogContent: ComponentType<{ closeDialog: () => void }>
    }
}
function GlobalDialogUI({ routes }: { routes: CustomRoute[] }) {
    const location = useLocation()
    const navigate = useNavigate()
    const currentRoute = routes.find((route) => route.path === location.pathname)
    const { open, closeDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.openGlobalDialog, (event) => {
        if (!event.open) return
        if (event.to) navigate(event.to, event.options)
    })

    return (
        <InjectedDialog
            open={open}
            title={
                currentRoute?.label ? (
                    <PluginI18NFieldRender pluginID={currentRoute.ID} field={currentRoute.label} />
                ) : null
            }
            onClose={closeDialog}
            withCheck={false}>
            <Routes>
                {routes.map((x) => {
                    const Component = x.UI.DialogContent
                    return <Route key={x.path} path={x.path} element={<Component closeDialog={closeDialog} />} />
                })}
            </Routes>
        </InjectedDialog>
    )
}
