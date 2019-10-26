// @flow

import {
    SET_THUMBNAIL_STYLE,
    SET_FILMSTRIP_STYLE,
    SET_FILMSTRIP_HIDDEN
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function setThumbnailStyle(thumbnailRadius: int, thumbnailMarginBottom: int) {
    return {
        type: SET_THUMBNAIL_STYLE,
        thumbnailRadius: thumbnailRadius,
        thumbnailMarginBottom: thumbnailMarginBottom
    };
}

export function setFilmstripStyle(filmstripMarginTop: int, filmstripMarginLeft: int) {
    return {
        type: SET_FILMSTRIP_STYLE,
        filmstripMarginTop: filmstripMarginTop,
        filmstripMarginLeft: filmstripMarginLeft
    };
}

export function setFilmstripHidden(filmstripState: boolean) {
    return {
        type: SET_FILMSTRIP_HIDDEN,
        filmstripState: filmstripState
    };
}
