// @flow
import { NativeEventEmitter, NativeModules } from 'react-native';
import {
    CONFERENCE_FAILED,
    CONFERENCE_JOINED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN,
    SET_ROOM
} from '../base/conference';
import {
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT
} from '../base/participants'
import { LOAD_CONFIG_ERROR } from '../base/config';
import {
    CONNECTION_DISCONNECTED,
    CONNECTION_FAILED
} from '../base/connection';
import {
    SELECT_LARGE_VIDEO_PARTICIPANT
} from '../large-video';
import {
    PIN_PARTICIPANT
} from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { appNavigate } from '../app/actions';
import { disconnect } from '../base/connection';
import {
    setThumbnailSize,
    setFilmstripHidden
} from '../filmstrip/atheerActions';
import {
    setAudioMuted,
    setVideoMuted,
    toggleCameraFacingMode
} from '../base/media/actions';

import { sendEvent } from '../mobile/external-api/functions';

import {
    ATHEER_LISTENERS,
    ATHEER_LISTENER_KEYS
} from './atheerConstants'

const logger = require('jitsi-meet-logger').getLogger(__filename);

const { RNEventEmitter } = NativeModules;
const emitter = new NativeEventEmitter(RNEventEmitter);

var userHashDict = {};
var jitsiHashDict = {};

var Store: Object;

// Atheer Emitters
/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.HANG_UP, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.HANG_UP + ' in emitter');
    if (Store) {
        Store.dispatch(disconnect(true));
    }
});

/*
    required keys:
    audioState
*/
emitter.addListener(ATHEER_LISTENERS.MUTE_AUDIO, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.MUTE_AUDIO + ' in emitter');
    if (Store && data != null) {
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.AUDIO_STATE) {
                logger.log('jitsi emitter receive key' + data[key]);
                Store.dispatch(setAudioMuted(data[key], true));
            }
        });
    }
});

/*
    required keys:
    videoState
*/
emitter.addListener(ATHEER_LISTENERS.MUTE_VIDEO, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.MUTE_VIDEO + ' in emitter');
    if (Store && data != null) {
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.VIDEO_STATE) {
                logger.log('jitsi emitter receive key' + data[key]);
                Store.dispatch(setVideoMuted(data[key]));
            }
        });
    }
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.TOGGLE_CAMERA, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.TOGGLE_CAMERA + ' in emitter');
    if (Store && data != null) {
        Store.dispatch(toggleCameraFacingMode());
    }
});

/*
    required keys:
    width
    height
    widthInterval
*/
emitter.addListener(ATHEER_LISTENERS.SET_THUMBNAIL_SIZE, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.SET_THUMBNAIL_SIZE + ' in emitter');
    if (Store && data != null) {
        var width = 0;
        var height = 0;
        var widthInterval = 0;
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.WIDTH) {
                logger.log('jitsi emitter receive key' + data[key]);
                width = (data[key]);
            }
            if (key === ATHEER_LISTENER_KEYS.HEIGHT) {
                logger.log('jitsi emitter receive key' + data[key]);
                height = (data[key]);
            }
            if (key === ATHEER_LISTENER_KEYS.WIDTH_INTERVAL) {
                logger.log('jitsi emitter receive key' + data[key]);
                widthInterval = (data[key]);
            }
            if (width != 0 && height != 0) {
                Store.dispatch(setThumbnailSize(width, height, widthInterval));
            }
        });
    }
});

/*
    required keys:
    filmstripState
*/
emitter.addListener(ATHEER_LISTENERS.HIDE_FILMSTRIP, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.HIDE_FILMSTRIP + ' in emitter');
    if (Store && data != null) {
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.FILMSTRIP_STATE) {
                logger.log('jitsi emitter receive key' + data[key]);
                Store.dispatch(setFilmstripHidden(data[key]));
            }
        });
    }
});

/**
 * Middleware that captures Redux actions and uses the ExternalAPI module to
 * turn them into native events so the application knows about them.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);
    const { type } = action;

    switch (type) {
    case CONFERENCE_FAILED: {
        break;
    }

    case CONFERENCE_JOINED:
        logger.log('hao check conference joined');
        break;

    case CONFERENCE_LEFT:
        logger.log('hao check conference left');
        jitsiHashDict = [];
        userHashDict = [];
        break;

    case CONFERENCE_WILL_JOIN:
        break;

    case CONNECTION_DISCONNECTED: {
        logger.log('hao check connection CONNECTION_DISCONNECTED');
        break;
    }

    case PARTICIPANT_JOINED:
        userHashDict[action.participant.id] = action.participant.name;
        jitsiHashDict[action.participant.name] = action.participant.id;
        sendEvent(store, type,
        /* data */ {
            jitsiParticipantId: action.participant.id,
            atheerUser: _getAtheerUserhash(action.participant.name)
        });
        break;

    case PARTICIPANT_LEFT:
        sendEvent(store, type,
        /* data */ {
            jitsiParticipantId: action.participant.id,
            atheerUser: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case CONNECTION_FAILED:
        break;

    case LOAD_CONFIG_ERROR:
        break;

    case PIN_PARTICIPANT:
        sendEvent(store, type,
        /* data */ {
            jitsiParticipantId: action.participant.id,
            atheerUser: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case SET_ROOM:
        Store = store;
        break;
    }

    return result;
});

// Hao change this once we figure out new naming convention
function _getAtheerUserhash(fullUsername) {
    /*if (!fullUsername || fullUsername == undefined) {
        return;
    }
    var splitParts = fullUsername.split(displayNameSplit);
    if (splitParts.length > 1) {
        return splitParts[1];
    }*/
    return fullUsername;
}

function _getJitsiParticipantId(atheerUserhash) {
    for (var key in jitsiHashDict) {
        if (_getAtheerUserhash(key) == atheerUserhash) {
            return jitsiHashDict[key];
        }
    }
    return 'localuser';
}
