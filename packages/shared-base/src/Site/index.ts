import { EnhanceableSite, ExtensionSite } from './type.js'

export * from './type.js'

const matchEnhanceableSiteHost: Record<EnhanceableSite, RegExp> = {
    [EnhanceableSite.Localhost]: /localhost/i,
    [EnhanceableSite.Facebook]: /facebook\.com/i,
    [EnhanceableSite.Twitter]: /twitter\.com/i,
    [EnhanceableSite.Minds]: /minds\.com/i,
    [EnhanceableSite.Instagram]: /instagram\.com/i,
    [EnhanceableSite.OpenSea]: /opensea\.io/i,
    [EnhanceableSite.Mirror]: /mirror\.xyz/i,
}

const matchExtensionSitePathname: Record<ExtensionSite, RegExp> = {
    [ExtensionSite.Dashboard]: /dashboard\.html/i,
    [ExtensionSite.Popup]: /popups\.html/i,
    [ExtensionSite.PopupConnect]: /popups-connect\.html/i,
}

export function getEnhanceableSiteType(url?: string) {
    const { host } = location
    const target = url ?? host
    for (const [type, regexp] of Object.entries(matchEnhanceableSiteHost)) {
        if (target.match(regexp)) return type as EnhanceableSite
        continue
    }
    return
}

function getExtensionSiteType(url?: string) {
    const { pathname } = location
    const target = url ?? pathname
    for (const [type, regexp] of Object.entries(matchExtensionSitePathname)) {
        if (target.match(regexp)) return type as ExtensionSite
        continue
    }
    return
}

export function getSiteType(url?: string) {
    return getEnhanceableSiteType(url) ?? getExtensionSiteType(url)
}

export function isEnhanceableSiteType() {
    return !!getEnhanceableSiteType()
}

export function isExtensionSiteType() {
    return !!getExtensionSiteType()
}

export function isFirefox() {
    return process.env.engine === 'firefox'
}

export function isEthereumInjected() {
    return !isExtensionSiteType() && !isFirefox()
}

export function isOpera() {
    return globalThis.navigator?.userAgent.includes('OPR/')
}

export function isTwitter() {
    return location.href.includes(EnhanceableSite.Twitter)
}
