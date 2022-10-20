import { memo, PropsWithChildren, useCallback, useMemo } from 'react'
import { alpha, Box, Button } from '@mui/material'
import { Icons } from '@masknet/icons'
import {
    useCurrentWeb3NetworkPluginID,
    useProviderDescriptor,
    useRecentTransactions,
    useNetworkDescriptor,
    useWallet,
    useReverseAddress,
    useWeb3State,
    useProviderType,
    useChainId,
    useAccount,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { GlobalDialogRoutes, isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { TransactionStatusType } from '@masknet/web3-shared-base'
import { useSharedI18N } from '../../../locales/index.js'
import { ProviderType } from '@masknet/web3-shared-evm'
import { WalletDescription } from './WalletDescription.js'
import { Action } from './Action.js'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { useGlobalDialogController } from '../../../hooks/useGlobalDialogController.js'

const isDashboard = isDashboardPage()

export const useStyles = makeStyles()((theme) => ({
    root: {
        boxSizing: 'content-box',
        display: 'flex',
        backgroundColor: isDashboard ? MaskColorVar.mainBackground : alpha(theme.palette.maskColor.bottom, 0.8),
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(16px)',
        padding: theme.spacing(2),
        borderRadius: '0 0 12px 12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
        maxHeight: 40,
    },
    connection: {
        width: 18,
        height: 18,
        marginRight: 8,
    },
}))

export interface WalletStatusBarProps<T extends NetworkPluginID> extends PropsWithChildren<{}> {
    className?: string
    expectedPluginID?: T
    expectedChainId?: Web3Helper.Definition[T]['ChainId']
    onClick?: (ev: React.MouseEvent<HTMLDivElement>) => void
}

export const PluginWalletStatusBar = memo<WalletStatusBarProps<NetworkPluginID>>(
    ({ className, onClick, expectedPluginID, expectedChainId, children }) => {
        const t = useSharedI18N()
        const { classes, cx } = useStyles()

        const pluginID = useCurrentWeb3NetworkPluginID()
        const account = useAccount(pluginID)
        const wallet = useWallet(pluginID)
        const chainId = useChainId(pluginID)
        const providerDescriptor = useProviderDescriptor()
        const providerType = useProviderType()
        const networkDescriptor = useNetworkDescriptor(pluginID, chainId)
        const expectedNetworkDescriptor = useNetworkDescriptor(expectedPluginID, expectedChainId)
        const { value: domain } = useReverseAddress(pluginID, account)
        const { Others } = useWeb3State()

        const openSelectProviderDialog = useCallback(() => {
            openGlobalDialog<{ network?: Web3Helper.NetworkDescriptorAll }>(GlobalDialogRoutes.SelectProvider, {
                state: { network: expectedNetworkDescriptor },
            })
        }, [expectedNetworkDescriptor])

        const { openGlobalDialog } = useGlobalDialogController()

        const openWalletStatusDialog = useCallback(() => {
            openGlobalDialog(GlobalDialogRoutes.WalletStatus)
        }, [openGlobalDialog])
        const pendingTransactions = useRecentTransactions(pluginID, TransactionStatusType.NOT_DEPEND)

        const walletName = useMemo(() => {
            if (domain) return domain
            if (providerType === ProviderType.MaskWallet && wallet?.name) return wallet?.name
            return providerDescriptor?.name || Others?.formatAddress(account, 4)
        }, [account, domain, providerType, wallet?.name, providerDescriptor?.name, Others?.formatAddress])

        if (!account) {
            return (
                <Box className={cx(classes.root, className)}>
                    <Button fullWidth onClick={openSelectProviderDialog}>
                        <Icons.ConnectWallet className={classes.connection} /> {t.plugin_wallet_connect_a_wallet()}
                    </Button>
                </Box>
            )
        }

        return (
            <Box className={cx(classes.root, className)}>
                <WalletDescription
                    pending={!!pendingTransactions.length}
                    providerIcon={providerDescriptor?.icon}
                    networkIcon={networkDescriptor?.icon}
                    iconFilterColor={providerDescriptor?.iconFilterColor}
                    name={walletName}
                    formattedAddress={Others?.formatAddress(account, 4)}
                    addressLink={Others?.explorerResolver.addressLink?.(chainId, account)}
                    onClick={onClick ?? openSelectProviderDialog}
                    onPendingClick={openWalletStatusDialog}
                />
                <Action openSelectWalletDialog={openSelectProviderDialog}>{children}</Action>
            </Box>
        )
    },
)
