// @flow

import {
    SET_THUMBNAIL_SIZE,
    SET_FILMSTRIP_HIDDEN
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function setThumbnailSize(width: int, height: int, widthInterval: int) {
    return {
        type: SET_THUMBNAIL_SIZE,
        width: width,
        height: height,
        widthInterval: widthInterval
    };
}

export function setFilmstripHidden(filmstripState: boolean) {
    return {
        type: SET_FILMSTRIP_HIDDEN,
        filmstripState: filmstripState
    };
}
