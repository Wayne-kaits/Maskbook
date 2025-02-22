import type { PostIdentifier } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import type { SocialNetwork } from '@masknet/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context.js'
import { hasPayloadLike } from '../../utils/index.js'
import { mindsBase } from './base.js'
import { usernameValidator } from './utils/user.js'
import { MindsAdaptor } from '../../../shared/site-adaptors/implementations/minds.com.js'

const getPostURL = (post: PostIdentifier): URL => {
    return new URL(`https://minds.com/newsfeed/${post.postId}`)
}
export const mindsShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...mindsBase,
    utils: {
        isValidUsername: usernameValidator,
        getPostURL,
        share(message) {
            openWindow(MindsAdaptor.getShareLinkURL?.(message))
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            hasPayloadLike,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
