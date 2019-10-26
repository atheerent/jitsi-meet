// @flow

import {
    SET_THUMBNAIL_STYLE,
    SET_FILMSTRIP_HIDDEN
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function setThumbnailStyle(thumbnailRadius: int) {
    return {
        type: SET_THUMBNAIL_STYLE,
        thumbnailRadius: thumbnailRadius
    };
}

export function setFilmstripHidden(filmstripState: boolean) {
    return {
        type: SET_FILMSTRIP_HIDDEN,
        filmstripState: filmstripState
    };
}
