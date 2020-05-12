// @flow

import {
    SET_THUMBNAIL_STYLE,
    SET_FILMSTRIP_STYLE,
    SET_FILMSTRIP_HIDDEN,
    SHOW_CONNECTIONS,
    UPDATE_CONNECTIONS
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function showConnectionStats(speed: string) {
    return {
        type: SHOW_CONNECTIONS,
        speed: speed
    };
}

export function updateConnectionStats(participant: string, speed: string) {
    return {
        type: UPDATE_CONNECTIONS,
        participant: participant,
        speed: speed
    };
}

export function setThumbnailStyle(thumbnailRadius: int, thumbnailMarginBottom: int) {
    return {
        type: SET_THUMBNAIL_STYLE,
        thumbnailRadius: thumbnailRadius,
        thumbnailMarginBottom: thumbnailMarginBottom
    };
}

export function setFilmstripStyle(filmstripMarginBottom: int, filmstripMarginLeft: int) {
    return {
        type: SET_FILMSTRIP_STYLE,
        filmstripMarginBottom: filmstripMarginBottom,
        filmstripMarginLeft: filmstripMarginLeft
    };
}

export function setFilmstripHidden(filmstripState: boolean) {
    return {
        type: SET_FILMSTRIP_HIDDEN,
        filmstripState: filmstripState
    };
}
