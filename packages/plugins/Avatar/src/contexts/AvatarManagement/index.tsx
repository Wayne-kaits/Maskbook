import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { noop } from 'lodash-es'
import {
    createContext,
    Dispatch,
    FC,
    memo,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useState,
} from 'react'
import { PFP_TYPE, SelectTokenInfo } from '../../types.js'

interface AvatarManagementContextOptions {
    targetAccount: string
    setTargetAccount: (account: string) => void
    // TODO: PFP_TYPE.background is unused
    pfpType: PFP_TYPE
    proof: BindingProof | undefined
    setProof: Dispatch<SetStateAction<BindingProof | undefined>>
    proofs: BindingProof[]
    setProofs: Dispatch<SetStateAction<BindingProof[]>>
    tokenInfo: Web3Helper.NonFungibleTokenAll | undefined
    setTokenInfo: Dispatch<SetStateAction<Web3Helper.NonFungibleTokenAll | undefined>>
    selectedTokenInfo: SelectTokenInfo | undefined
    setSelectedTokenInfo: Dispatch<SetStateAction<SelectTokenInfo | undefined>>
}

export const AvatarManagementContext = createContext<AvatarManagementContextOptions>({
    targetAccount: '',
    setTargetAccount: noop,
    pfpType: PFP_TYPE.PFP,
    proof: undefined,
    setProof: noop,
    proofs: EMPTY_LIST,
    setProofs: noop,
    tokenInfo: undefined,
    setTokenInfo: noop,
    selectedTokenInfo: undefined,
    setSelectedTokenInfo: noop,
})

interface Props extends PropsWithChildren<{}> {}

export const AvatarManagementProvider: FC<Props> = memo(({ children }) => {
    const [proof, setProof] = useState<BindingProof>()
    const [proofs, setProofs] = useState<BindingProof[]>(EMPTY_LIST)
    const [tokenInfo, setTokenInfo] = useState<Web3Helper.NonFungibleTokenAll>()
    const { account } = useChainContext()
    const [selectedAccount, setSelectedAccount] = useState(account)
    const targetAccount = selectedAccount || account || proofs[0]?.identity
    const [selectedTokenInfo, setSelectedTokenInfo] = useState<SelectTokenInfo>()

    const contextValue: AvatarManagementContextOptions = useMemo(() => {
        return {
            pfpType: PFP_TYPE.PFP,
            targetAccount,
            setTargetAccount: setSelectedAccount,
            proof,
            setProof,
            proofs,
            setProofs,
            tokenInfo,
            setTokenInfo,
            selectedTokenInfo,
            setSelectedTokenInfo,
        }
    }, [targetAccount, proof, proofs, tokenInfo, selectedTokenInfo])

    return <AvatarManagementContext.Provider value={contextValue}>{children}</AvatarManagementContext.Provider>
})

AvatarManagementProvider.displayName = 'AvatarManagementProvider'

export function useAvatarManagement() {
    return useContext(AvatarManagementContext)
}
