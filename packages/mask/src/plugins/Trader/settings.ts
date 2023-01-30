import { ValueRefWithReady } from '@masknet/shared-base'
import { createGlobalSettings } from '../../../shared/legacy-settings/createSettings.js'
import { PLUGIN_ID, SLIPPAGE_DEFAULT } from './constants/index.js'

/**
 * The slippage tolerance of trader
 */
export const currentSlippageSettings: ValueRefWithReady<number> = createGlobalSettings(
    `${PLUGIN_ID}+slippageTolerance`,
    SLIPPAGE_DEFAULT,
)

/**
 * Single Hop
 */
export const currentSingleHopOnlySettings: ValueRefWithReady<boolean> = createGlobalSettings(
    `${PLUGIN_ID}+singleHopOnly`,
    false,
)
