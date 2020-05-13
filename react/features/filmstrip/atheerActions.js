// @flow

import {
    SET_THUMBNAIL_STYLE,
    SET_FILMSTRIP_STYLE,
    SET_FILMSTRIP_HIDDEN,
    SHOW_CONNECTIONS,
    UPDATE_CONNECTIONS
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function showConnectionStats(participantId: string) {
    return {
        type: SHOW_CONNECTIONS,
        participantId: participantId
    };
}

export function updateConnectionStats(participantId: string, percent: string, bandwidthUp: string, bandwidthDown: string,
    bitrateUp: string, bitrateDown: string, bridgeCount: string, e2eRtt: string, framerate: string, packetLossUp: string, packetLossDown: string,
    region: string, resolution: string, serverRegion: string, localIP: string, remoteIP: string, transportType: string) {
    return {
        type: UPDATE_CONNECTIONS,
        participant: participantId,
        speed: percent,
        bandwidthUp: bandwidthUp,
        bandwidthDown: bandwidthDown,
        bitrateUp: bitrateUp,
        bitrateDown: bitrateDown,
        bridgeCount: bridgeCount,
        e2eRtt: e2eRtt,
        framerate: framerate,
        packetLossUp: packetLossUp,
        packetLossDown: packetLossDown,
        region: region,
        resolution: resolution,
        serverRegion: serverRegion,
        localIP: localIP,
        remoteIP: remoteIP,
        transportType: transportType
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
