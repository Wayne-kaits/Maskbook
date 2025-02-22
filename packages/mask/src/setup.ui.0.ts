import type { KVStorageBackend } from '@masknet/shared-base'
import { setupMaskKVStorageBackend } from '../shared/kv-storage.js'
import { setupLegacySettingsAtNonBackground } from '../shared/legacy-settings/createSettings.js'
import Services from './extension/service.js'
import { contentFetch } from './utils/fetcher.js'

const memory: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('memory', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('memory', ...args)
    },
}
const indexedDB: KVStorageBackend = {
    beforeAutoSync: Promise.resolve(),
    getValue(...args) {
        return Services.Settings.__kv_storage_read__('indexedDB', ...args)
    },
    async setValue(...args) {
        await Services.Settings.__kv_storage_write__('indexedDB', ...args)
    },
}
setupMaskKVStorageBackend(indexedDB, memory)
setupLegacySettingsAtNonBackground(Services.Settings.getLegacySettingsInitialValue)

Reflect.set(globalThis, 'fetch', contentFetch)
