import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base.js'

const worker: Plugin.Worker.Definition = {
    ...base,
    init(signal, context) {},
}

export default worker
