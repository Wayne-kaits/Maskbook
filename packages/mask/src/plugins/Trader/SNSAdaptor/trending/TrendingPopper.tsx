import { PluginTransakMessages } from '@masknet/plugin-transak'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import type { PopperUnstyledOwnProps } from '@mui/base'
import { ClickAwayListener, Fade, Popper, PopperProps } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useWindowScroll } from 'react-use'
import { WalletMessages } from '../../../Wallet/messages.js'
import { PluginTraderMessages } from '../../messages.js'

export interface TrendingPopperProps extends Omit<PopperProps, 'children' | 'open'> {
    children?: (
        name?: string,
        type?: TrendingAPI.TagType,
        address?: string,
        isNFTProjectPopper?: boolean,
        reposition?: () => void,
    ) => React.ReactNode
    PopperProps?: Partial<PopperProps>
}

export function TrendingPopper({ children, ...rest }: TrendingPopperProps) {
    const popperRef = useRef<{
        update(): void
    } | null>(null)
    const [active, setActive] = useState(false)
    const freezedRef = useRef(false) // disable any click
    const closeTimerRef = useRef<NodeJS.Timeout>()
    const [name, setName] = useState('')
    const [isNFTProjectPopper, setIsNFTProjectPopper] = useState(false)
    const [address, setAddress] = useState('')
    const [type, setType] = useState<TrendingAPI.TagType | undefined>()
    const [anchorEl, setAnchorEl] = useState<PopperUnstyledOwnProps['anchorEl']>(null)
    const popper = useRef<HTMLDivElement | null>(null)

    // #region select token and provider dialog could be opened by trending view
    const onFreezed = useCallback((ev: { open: boolean }) => {
        freezedRef.current = ev.open
    }, [])
    useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated, onFreezed)
    useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated, onFreezed)
    useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated, onFreezed)
    // #endregion

    const closePopper = useCallback(() => {
        if (freezedRef.current) return
        setActive(false)
    }, [])

    // #region open or close popper
    // open popper from message center
    useEffect(() => {
        return PluginTraderMessages.trendingAnchorObserved.on((ev) => {
            setName(ev.name)
            setType(ev.type)
            setAddress(ev.address ?? '')
            setIsNFTProjectPopper(Boolean(ev.isNFTProjectPopper))
            setAnchorEl({ getBoundingClientRect: () => ev.element!.getBoundingClientRect() })
            setActive(true)
            clearTimeout(closeTimerRef.current)
        })
    }, [])

    // close popper if location was changed
    const location = useLocation()
    useEffect(() => setActive(false), [location.state?.key, location.href])

    // close popper if scroll out of visual screen
    const position = useWindowScroll()
    useEffect(() => {
        if (!popper.current) return
        const { top, height } = popper.current.getBoundingClientRect()
        if ((top < 0 && -top > height) || top > document.documentElement.clientHeight) {
            // out off bottom bound
            setActive(false)
        }
    }, [popper, Math.floor(position.y / 50)])
    // #endregion

    const holderRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!holderRef.current) return
        const holder = holderRef.current
        const enter = () => {
            clearTimeout(closeTimerRef.current)
        }
        const leave = () => {
            closeTimerRef.current = setTimeout(() => {
                closePopper()
            }, 500)
        }
        holder.addEventListener('mouseenter', enter)
        holder.addEventListener('mouseleave', leave)
        return () => {
            holder.removeEventListener('mouseenter', enter)
            holder.removeEventListener('mouseleave', leave)
        }
    }, [holderRef.current])

    if (!type) return null

    return (
        <ClickAwayListener onClickAway={closePopper}>
            <Popper
                ref={popper}
                open={active}
                anchorEl={anchorEl}
                style={{ zIndex: 100 }}
                popperRef={(ref) => (popperRef.current = ref)}
                transition
                disablePortal
                popperOptions={{
                    strategy: 'absolute',
                    modifiers: [
                        {
                            name: 'preventOverflow',
                            options: {
                                tether: false,
                                rootBoundary: 'viewport',
                                padding: 4,
                            },
                        },
                    ],
                }}
                {...rest}>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps}>
                        <div ref={holderRef}>
                            {children?.(name, type, address, isNFTProjectPopper, () => {
                                requestAnimationFrame(() => popperRef.current?.update())
                            })}
                        </div>
                    </Fade>
                )}
            </Popper>
        </ClickAwayListener>
    )
}
