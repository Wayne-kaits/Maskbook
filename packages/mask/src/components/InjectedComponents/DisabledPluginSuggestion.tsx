import { Icons } from '@masknet/icons'
import {
    BooleanPreference,
    Plugin,
    PluginI18NFieldRender,
    registeredPlugins,
    useActivatedPluginsSNSAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { MaskPostExtraInfoWrapper } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskLightTheme } from '@masknet/theme'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Box, BoxProps, Button, Skeleton, Typography, useTheme } from '@mui/material'
import { ReactNode, useCallback } from 'react'
import { useAsync } from 'react-use'
import type { Option } from 'ts-results-es'
import { useSubscription } from 'use-subscription'
import Services from '../../extension/service.js'
import { useI18N } from '../../utils/index.js'

function useDisabledPlugins() {
    const activated = new Set(useActivatedPluginsSNSAdaptor('any').map((x) => x.ID))
    const minimalMode = new Set(useActivatedPluginsSNSAdaptor(true).map((x) => x.ID))
    const disabledPlugins = useSubscription(registeredPlugins)
        .filter((plugin) => !activated.has(plugin[0]) || minimalMode.has(plugin[0]))
        .map((x) => x[1])
    return disabledPlugins
}

export function useDisabledPluginSuggestionFromPost(postContent: Option<string>, metaLinks: readonly string[]) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.postContent)

    const { some } = postContent
    const matches = disabled.filter((x) => {
        for (const pattern of x.contribution!.postContent!) {
            if (some && postContent.val.match(pattern)) return true
            if (metaLinks.some((link) => link.match(pattern))) return true
        }
        return false
    })
    return matches
}

export function useDisabledPluginSuggestionFromMeta(meta: undefined | ReadonlyMap<string, unknown>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.metadataKeys)
    if (!meta) return EMPTY_LIST
    const keys = [...meta.keys()]

    const matches = disabled.filter((x) => {
        const contributes = x.contribution!.metadataKeys!
        return keys.some((key) => contributes.has(key))
    })
    return matches
}

export function PossiblePluginSuggestionPostInspector() {
    const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
    const metaLinks = usePostInfoDetails.mentionedLinks()
    const matches = useDisabledPluginSuggestionFromPost(message, metaLinks)
    return <PossiblePluginSuggestionUI plugins={matches} />
}
export function PossiblePluginSuggestionUI(props: { plugins: Plugin.Shared.Definition[] }) {
    const { plugins } = props
    const _plugins = useActivatedPluginsSNSAdaptor('any')
    if (!plugins.length) return null
    return (
        <>
            {plugins.map((define) => (
                <PossiblePluginSuggestionUISingle
                    define={define}
                    key={define.ID}
                    wrapperProps={_plugins.find((y) => y.ID === define.ID)?.wrapperProps}
                />
            ))}
        </>
    )
}

export function PossiblePluginSuggestionUISingle(props: {
    lackHostPermission?: boolean
    define: Plugin.Shared.Definition
    wrapperProps?: Plugin.SNSAdaptor.PluginWrapperProps | undefined
    content?: ReactNode
}) {
    const { define, lackHostPermission, wrapperProps, content } = props
    const { t } = useI18N()
    const theme = useTheme()
    const onClick = useCallback(() => {
        if (lackHostPermission && define.enableRequirement.host_permissions) {
            Services.Helper.requestHostPermission(define.enableRequirement.host_permissions)
        } else {
            Services.Settings.setPluginMinimalModeEnabled(define.ID, false)
        }
    }, [lackHostPermission, define])

    const { value: disabled } = useAsync(async () => {
        const status = await Services.Settings.getPluginMinimalModeEnabled(define.ID)
        return status === BooleanPreference.True
    }, [define.ID])

    const ButtonIcon = lackHostPermission ? Icons.Approve : Icons.Plugin
    const wrapperContent = content ?? <FallbackContent disabled={disabled} height={74} />
    const buttonLabel = lackHostPermission ? t('approve') : t('plugin_enables')

    return (
        <MaskPostExtraInfoWrapper
            ID={props.define.ID}
            open
            title={<PluginI18NFieldRender field={define.name} pluginID={define.ID} />}
            publisher={
                define.publisher ? (
                    <PluginI18NFieldRender pluginID={define.ID} field={define.publisher.name} />
                ) : undefined
            }
            publisherLink={define.publisher?.link}
            wrapperProps={wrapperProps}
            action={
                <Button
                    size="small"
                    startIcon={<ButtonIcon size={18} sx={{ lineHeight: 1 }} />}
                    variant="roundedDark"
                    onClick={onClick}
                    sx={{
                        backgroundColor: theme.palette.maskColor.dark,
                        color: 'white',
                        width: '254px',
                        height: '36px',
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        '&:hover': {
                            backgroundColor: theme.palette.maskColor.dark,
                        },
                    }}>
                    {buttonLabel}
                </Button>
            }
            content={wrapperContent}
        />
    )
}

const useStyles = makeStyles()(() => ({
    text: {
        color: MaskLightTheme.palette.maskColor.main,
    },
    rectangle: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
}))

export interface FallbackContentProps extends BoxProps {
    disabled?: boolean
}

export function FallbackContent({ disabled, ...rest }: FallbackContentProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    if (disabled)
        return (
            <Box component="div" flexDirection="column" justifyContent="center" {...rest}>
                <Typography className={classes.text}>{t('plugin_disabled_tip')}</Typography>
            </Box>
        )
    return (
        <Box component="div" flexDirection="column" pl={1} justifyContent="center" {...rest}>
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={103} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={68} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={48} height={16} />
        </Box>
    )
}
