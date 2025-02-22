import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCustomSnackbar } from '@masknet/theme'
import { DashboardRoutes, ECKeyIdentifier, PopupRoutes } from '@masknet/shared-base'
import { useDashboardI18N } from '../../../locales/index.js'
import { SignUpRoutePath } from '../routePath.js'
import { Messages, PluginServices, Services } from '../../../API.js'
import { PersonaNameUI } from './PersonaNameUI.js'
import { useCreatePersonaByPrivateKey, useCreatePersonaV2 } from '../../../hooks/useCreatePersonaV2.js'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext.js'
import { delay } from '@masknet/kit'
import { useAsync } from 'react-use'
import { SmartPayAccount, SmartPayBundler } from '@masknet/web3-providers'

export const PersonaRecovery = () => {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const createPersona = useCreatePersonaV2()
    const createPersonaByPrivateKey = useCreatePersonaByPrivateKey()
    const { showSnackbar } = useCustomSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const state = useLocation().state as {
        mnemonic?: string[]
        privateKey?: string
    }

    const [error, setError] = useState('')

    useAsync(async () => {
        if (state.mnemonic && (await Services.Identity.validateMnemonic(state.mnemonic.join(' ')))) return
        if (state.privateKey) return
        navigate(DashboardRoutes.SignUp, { replace: true })
    }, [state.mnemonic, state.privateKey])

    const onNext = useCallback(
        async (personaName: string) => {
            setError('')
            try {
                let identifier: ECKeyIdentifier
                if (state.mnemonic) {
                    identifier = await createPersona(state?.mnemonic.join(' '), personaName)
                } else if (state.privateKey) {
                    identifier = await createPersonaByPrivateKey(state.privateKey, personaName)
                } else {
                    setError('no available identifier')
                    return
                }

                const hasPaymentPassword = await PluginServices.Wallet.hasPassword()
                if (!hasPaymentPassword) {
                    const persona = await Services.Identity.queryPersonaDB(identifier)
                    const chainId = await SmartPayBundler.getSupportedChainId()
                    if (persona?.address) {
                        const smartPayAccounts = await SmartPayAccount.getAccountsByOwners(chainId, [persona?.address])

                        if (smartPayAccounts.filter((x) => x.deployed || x.funded).length) {
                            const backupInfo = await Services.Backup.addUnconfirmedBackup(
                                JSON.stringify({
                                    _meta_: {
                                        maskbookVersion: '',
                                        createdAt: null,
                                        type: 'maskbook-backup',
                                        version: 2,
                                    },
                                    personas: [
                                        {
                                            ...persona,
                                            linkedProfiles: [],
                                        },
                                    ],
                                    posts: [],
                                    profiles: [],
                                    relations: [],
                                    wallets: [],
                                    userGroups: [],
                                    grantedHostPermissions: [],
                                    plugin: [],
                                }),
                            )

                            if (backupInfo.ok) {
                                return Services.Helper.openPopupWindow(PopupRoutes.WalletRecovered, {
                                    backupId: backupInfo.val.id,
                                })
                            }
                        }
                    }
                }

                await changeCurrentPersona(identifier)
                showSnackbar(t.create_account_persona_successfully(), { variant: 'success' })

                await delay(300)
                Messages.events.restoreSuccess.sendToAll({ wallets: [] })
                navigate(`${DashboardRoutes.SignUp}/${SignUpRoutePath.ConnectSocialMedia}`)
            } catch (error) {
                setError((error as Error).message)
            }
        },
        [state?.mnemonic, state?.privateKey],
    )

    return <PersonaNameUI onNext={onNext} error={error} />
}
