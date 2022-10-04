import LoadingButton from '@mui/lab/LoadingButton'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import type { UserBet } from '../types'
import { useAsyncFn } from 'react-use'
import { useAzuroLPContract } from '../hooks/useAzuroContract'
import { useAccount, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeContractTransaction } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    redeemButton: {
        background: theme.palette.success.light,
        color: theme.palette.text.buttonText,
        padding: theme.spacing(0.25, 1),
        '&:hover': {
            background: theme.palette.success.light,
        },
    },
}))

interface RedeemButtonProps {
    bet: UserBet
    retry: () => void
}

export function RedeemButton(props: RedeemButtonProps) {
    const t = useI18N()
    const { bet, retry } = props
    const { classes } = useStyles()
    const azuroContract = useAzuroLPContract()
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const isResultPositive = bet.result > 0

    const [{ loading }, doFetch] = useAsyncFn(async () => {
        if (!azuroContract) return

        const config = {
            from: account,
        }

        const tx = await encodeContractTransaction(
            azuroContract,
            azuroContract.methods.withdrawPayoutNative(bet.nftId),
            config,
        )

        const hash = await connection?.sendTransaction(tx)
        if (!hash) return

        retry()

        return hash
    }, [bet.nftId, retry, connection, azuroContract, account])

    return (
        <LoadingButton
            onClick={() => doFetch()}
            className={classes.redeemButton}
            size="small"
            loading={loading}
            disabled={bet.isRedeemed || loading}>
            {bet.isRedeemed ? t.plugin_redeemed() : t.plugin_redeem()}
        </LoadingButton>
    )
}
