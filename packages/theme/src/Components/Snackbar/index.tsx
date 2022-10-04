import { forwardRef, useRef, memo, useCallback } from 'react'
import { keyframes } from 'tss-react'
import {
    SnackbarProvider,
    SnackbarProviderProps,
    SnackbarKey,
    useSnackbar,
    VariantType,
    SnackbarMessage,
    SnackbarContent,
    SnackbarAction,
    OptionsObject,
} from 'notistack'
import { Typography, IconButton, alpha } from '@mui/material'
import classnames from 'classnames'
import { Close as CloseIcon } from '@mui/icons-material'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import { Icons } from '@masknet/icons'
import { makeStyles, useStylesExtends } from '../../UIHelper/index.js'
import { MaskColorVar } from '../../CSSVariables/index.js'
import { usePortalShadowRoot } from '../../entry-base.js'

export { PopupSnackbarProvider, usePopupCustomSnackbar } from './PopupSnackbar.js'
export { SnackbarProvider, useSnackbar } from 'notistack'
export type { VariantType, OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack'

interface StyleProps {
    offsetY?: number
}

const useStyles = makeStyles<StyleProps, 'title' | 'message'>()((theme, { offsetY }, refs) => {
    const spinningAnimationKeyFrames = keyframes`
        to {
          transform: rotate(360deg)
        }
    `
    const title = {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
    } as const
    const message = {
        color: theme.palette.maskColor.main,
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        lineHeight: '18px',
        '& > a': {
            display: 'flex',
            alignItems: 'center',
        },
    } as const
    const defaultVariant = {
        background: theme.palette.maskColor.bottom,
        color: theme.palette.maskColor.main,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },

        [`& .${refs.message}`]: {
            color: 'inherit',
        },
    }
    const success = {
        backgroundColor: theme.palette.maskColor.success,
        color: theme.palette.maskColor.white,
        boxShadow: `0px 6px 20px ${alpha(theme.palette.maskColor.success, 0.15)}`,
        backdropFilter: 'blur(16px)',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: alpha(theme.palette.maskColor.white, 0.8),
            '& svg': {
                color: theme.palette.maskColor.white,
            },
        },
    } as const

    const error = {
        background: theme.palette.maskColor.danger,
        color: theme.palette.maskColor.white,
        boxShadow: `0px 6px 20px ${alpha(theme.palette.maskColor.danger, 0.15)}`,
        backdropFilter: 'blur(16px)',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: alpha(theme.palette.maskColor.white, 0.8),
            '& svg': {
                color: theme.palette.maskColor.white,
            },
        },
    } as const

    const info = {
        background: theme.palette.maskColor.primary,
        color: theme.palette.maskColor.white,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 4px 30px rgba(255, 255, 255, 0.15)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: alpha(theme.palette.maskColor.white, 0.8),
            '& svg': {
                color: theme.palette.maskColor.white,
            },
        },
    }

    const warning = {
        backgroundColor: theme.palette.maskColor.warn,
        color: theme.palette.maskColor.white,
        boxShadow: `0px 6px 20px ${alpha(theme.palette.maskColor.warn, 0.15)}`,
        backdropFilter: 'blur(16px)',
        [`& .${refs.title}`]: {
            color: 'inherit',
        },
        [`& .${refs.message}`]: {
            color: alpha(theme.palette.maskColor.white, 0.8),
            '& svg': {
                color: theme.palette.maskColor.white,
            },
        },
    } as const

    return {
        root: {
            zIndex: 9999,
            transform: typeof offsetY !== 'undefined' ? `translateY(${offsetY}px)` : 'none',
            color: MaskColorVar.textLight,
            pointerEvents: 'inherit',
        },
        content: {
            alignItems: 'center',
            padding: theme.spacing(1.5, 2),
            borderRadius: 12,
            width: 380,
            flexWrap: 'nowrap !important' as 'nowrap',
            [`&.${success.ref}`]: {
                background: MaskColorVar.greenMain,
                color: MaskColorVar.lightestBackground,
            },
            [`&.${error.ref}`]: {
                background: MaskColorVar.redMain,
                color: MaskColorVar.lightestBackground,
                title: {
                    color: 'inherit',
                },
            },
            [`&.${info.ref}`]: {
                color: MaskColorVar.lightestBackground,
            },
            [`&.${warning.ref}`]: {
                color: '#ffffff',
            },
        },
        default: defaultVariant,
        success,
        error,
        info,
        warning,
        icon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& > svg': {
                width: 24,
                height: 24,
            },
        },
        spinning: {
            display: 'flex',
            animation: `${spinningAnimationKeyFrames} 2s infinite linear`,
        },
        action: {
            marginLeft: 'auto',
        },
        closeButton: {
            color: 'inherit',
            transform: 'translateY(-10px)',
        },
        texts: {
            marginLeft: theme.spacing(1.5),
        },
        title,
        message,
    }
})

export interface CustomSnackbarContentProps {
    id: SnackbarKey
    title: SnackbarMessage
    message?: string | React.ReactNode
    icon?: React.ReactNode
    processing?: boolean
    variant?: VariantType
    action?: SnackbarAction
    offsetY?: number
    classes?: Partial<ReturnType<typeof useStyles>['classes']>
}
const IconMap: Record<VariantType, React.ReactNode> = {
    default: <InfoIcon color="inherit" />,
    success: <Icons.SuccessForSnackBar />,
    error: <Icons.TransactionFailed />,
    warning: <WarningIcon color="inherit" />,
    info: <InfoIcon color="inherit" />,
}

export const CustomSnackbarContent = forwardRef<HTMLDivElement, CustomSnackbarContentProps>((props, ref) => {
    const classes = useStylesExtends(useStyles({ offsetY: props.offsetY }), props)
    const snackbar = useSnackbar()
    const loadingIcon = <Icons.CircleLoading className={classes.spinning} />
    const variantIcon = props.processing ? loadingIcon : props.variant ? IconMap[props.variant] : null
    let renderedAction: React.ReactNode = (
        <IconButton className={classes.closeButton} onClick={() => snackbar.closeSnackbar(props.id)}>
            <CloseIcon />
        </IconButton>
    )
    if (props.action) {
        renderedAction = typeof props.action === 'function' ? props.action(props.id) : props.action
    }
    return (
        <SnackbarContent ref={ref} className={classnames(classes.content, classes[props.variant!])}>
            {variantIcon && <div className={classes.icon}>{variantIcon}</div>}
            <div className={classes.texts}>
                <Typography className={classes.title} variant="h2">
                    {props.title}
                </Typography>
                {props.message && (
                    <Typography className={classes.message} variant="body1">
                        {props.message}
                    </Typography>
                )}
            </div>
            <div className={classes.action}>{renderedAction}</div>
        </SnackbarContent>
    )
})

export const CustomSnackbarProvider = memo<
    SnackbarProviderProps & {
        offsetY?: number
    }
>(({ offsetY, ...rest }) => {
    const ref = useRef<SnackbarProvider>(null)
    const { classes } = useStyles({ offsetY })
    const onDismiss = (key: string | number) => () => {
        ref.current?.closeSnackbar(key)
    }

    return usePortalShadowRoot((container) => (
        <SnackbarProvider
            ref={ref}
            maxSnack={30}
            disableWindowBlurListener
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            hideIconVariant
            content={(key, title) => (
                <CustomSnackbarContent id={key} variant={rest.variant ?? 'default'} title={title} offsetY={offsetY} />
            )}
            action={(key) => (
                <IconButton size="large" onClick={onDismiss(key)} sx={{ color: 'inherit' }}>
                    <CloseIcon color="inherit" />
                </IconButton>
            )}
            classes={{
                containerRoot: classes.root,
                variantSuccess: classes.success,
                variantError: classes.error,
                variantInfo: classes.info,
                variantWarning: classes.warning,
            }}
            domRoot={container}
            {...rest}
        />
    ))
})

export interface ShowSnackbarOptions
    extends OptionsObject,
        Pick<CustomSnackbarContentProps, 'message' | 'processing' | 'icon' | 'classes'> {}

export function useCustomSnackbar() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const showSnackbar = useCallback(
        (
            text: SnackbarMessage,
            options: ShowSnackbarOptions = {
                variant: 'default',
            },
        ) => {
            const { processing, message, variant, ...rest } = options
            return enqueueSnackbar(text, {
                variant: options.variant,
                content: (key, title) => {
                    return (
                        <CustomSnackbarContent
                            variant={variant ?? 'default'}
                            id={key}
                            title={title}
                            message={message}
                            processing={processing}
                            action={rest.action}
                            classes={rest.classes}
                        />
                    )
                },
                ...rest,
            })
        },
        [enqueueSnackbar],
    )

    return { showSnackbar, closeSnackbar }
}
