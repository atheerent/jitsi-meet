// @flow

import {
    SET_THUMBNAIL_SIZE
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function setThumbnailSize(width: int, height: int) {
    logger.log('hao check receive setThumbnailSize', width, height);
    return {
        type: SET_THUMBNAIL_SIZE,
        width: width,
        height: height
    };
}
