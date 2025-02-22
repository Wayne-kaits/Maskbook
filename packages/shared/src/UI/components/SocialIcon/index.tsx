import type { ComponentType, FC, HTMLProps } from 'react'
import { GeneratedIconProps, Icons } from '@masknet/icons'

const socialIconMap = {
    'twitter.com': Icons.Twitter,
    'github.com': Icons.GitHub,
    default: Icons.Globe,
} satisfies Record<string, ComponentType<GeneratedIconProps<never>>>

interface Props extends HTMLProps<HTMLDivElement> {
    /** Social url */
    url?: string
}
export const SocialIcon: FC<Props> = ({ url, ...rest }) => {
    if (!url) return null

    const host = new URL(url).host as keyof typeof socialIconMap

    const Icon = socialIconMap[host] ?? socialIconMap.default

    return <Icon {...rest} />
}
