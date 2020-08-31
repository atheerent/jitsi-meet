// @flow
import { NativeEventEmitter, NativeModules } from 'react-native';
import {
    CONFERENCE_FAILED,
    CONFERENCE_JOINED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN,
    SET_ROOM,
    NOTIFY_CONFERENCE_START_TIME
} from '../base/conference';
import {
    pinParticipant,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    getLocalParticipant
} from '../base/participants'
import { LOAD_CONFIG_ERROR } from '../base/config';
import {
    CONNECTION_DISCONNECTED,
    CONNECTION_FAILED
} from '../base/connection';
import {
    SELECT_LARGE_VIDEO_PARTICIPANT,
} from '../large-video';
import {
    setAnnotationMode
} from '../large-video/atheerActions';
import {
    selectLocalParticipantInLargeVideo
} from '../large-video/actions';
import {
    startRecording,
    stopRecording
} from '../recording/actions';
import { RECORDING_SESSION_UPDATED } from '../recording/actionTypes'
import {
    setParticipantDisplayName,
    PIN_PARTICIPANT
} from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { appNavigate } from '../app/actions';
import { disconnect } from '../base/connection';
import {
    setThumbnailStyle,
    setFilmstripStyle,
    setFilmstripHidden
} from '../filmstrip/atheerActions';

import { SHOW_CONNECTIONS, UPDATE_CONNECTIONS } from '../filmstrip/atheerActionTypes';

import {
    setAudioMuted,
    setVideoMuted,
    toggleCameraFacingMode
} from '../base/media/actions';
import {
    toggleAtheerBuffer
} from '../base/media/atheerActions';

import { sendEvent } from '../mobile/external-api/functions';

import { getSessionById } from '../recording/functions';

import {
    ATHEER_LISTENERS,
    ATHEER_LISTENER_KEYS
} from './atheerConstants'

const logger = require('jitsi-meet-logger').getLogger(__filename);

const { WebRTCModule, RNEventEmitter } = NativeModules;
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
*/
emitter.addListener(ATHEER_LISTENERS.SET_PARTICIPANT_NAME, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.SET_PARTICIPANT_NAME + ' in emitter');
    if (Store && data != null) {
        var userhash = 'USERHASH';
        var username = 'LOCAL_USER';
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.USERNAME) {
                logger.log('jitsi emitter receive key' + data[key]);
                username = data[key];
            } else if (key === ATHEER_LISTENER_KEYS.USERHASH) {
                logger.log('jitsi emitter receive key' + data[key]);
                userhash = data[key];
            }
        });
        var displayName = userhash + ':' + username;
        Store.dispatch(setParticipantDisplayName(displayName));
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
    if (Store) {
        Store.dispatch(toggleCameraFacingMode());
    }
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.START_RECORDING, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.START_RECORDING + ' in emitter');
    if (Store) {
        Store.dispatch(startRecording());
    }
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.STOP_RECORDING, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.STOP_RECORDING + ' in emitter');
    if (Store) {
        Store.dispatch(stopRecording());
    }
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.TOGGLE_ATHEER_BUFFER, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.TOGGLE_ATHEER_BUFFER + ' in emitter');
    if (Store) {
        Store.dispatch(toggleAtheerBuffer());
    }
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.FLASHLIGHT_ON, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.FLASHLIGHT_ON + ' in emitter');
    WebRTCModule.toggleFlashlight(true);
});

/*
    required keys:
*/
emitter.addListener(ATHEER_LISTENERS.FLASHLIGHT_OFF, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.FLASHLIGHT_OFF + ' in emitter');
    WebRTCModule.toggleFlashlight(false);
});

/*
    required keys:
    thumbnailRadius
*/
emitter.addListener(ATHEER_LISTENERS.SET_THUMBNAIL_STYLE, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.SET_THUMBNAIL_STYLE + ' in emitter');
    if (Store && data != null) {
        var thumbnailRadius = 0;
        var thumbnailMarginBottom = 0;
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.THUMBNAIL_RADIUS) {
                logger.log('jitsi emitter receive key' + data[key]);
                thumbnailRadius = (data[key]);
            }
            if (key === ATHEER_LISTENER_KEYS.THUMBNAIL_MARGIN_BOTTOM) {
                logger.log('jitsi emitter receive key' + data[key]);
                thumbnailMarginBottom = (data[key]);
            }
            if (thumbnailRadius != 0) {
                Store.dispatch(setThumbnailStyle(thumbnailRadius, thumbnailMarginBottom));
            }
        });
    }
});

/*
    required keys:
    filmstripMarginBottom
    filmstripMarginLeft
*/
emitter.addListener(ATHEER_LISTENERS.SET_FILMSTRIP_STYLE, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.SET_FILMSTRIP_STYLE + ' in emitter');
    if (Store && data != null) {
        var filmstripMarginBottom = 0;
        var filmstripMarginLeft = 0;
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.FILMSTRIP_MARGIN_BOTTOM) {
                logger.log('jitsi emitter receive key' + data[key]);
                filmstripMarginBottom = (data[key]);
            }
            if (key === ATHEER_LISTENER_KEYS.FILMSTRIP_MARGIN_LEFT) {
                logger.log('jitsi emitter receive key' + data[key]);
                filmstripMarginLeft = (data[key]);
            }
            if (filmstripMarginBottom != 0 && filmstripMarginLeft != 0) {
                Store.dispatch(setFilmstripStyle(filmstripMarginBottom, filmstripMarginLeft));
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

/*
    required keys:
    annotationState
*/
emitter.addListener(ATHEER_LISTENERS.SET_ANNOTATION_MODE, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.SET_ANNOTATION_MODE + ' in emitter');
    if (Store && data != null) {
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.ANNOTATION_STATE) {
                logger.log('jitsi emitter receive key' + data[key]);
                Store.dispatch(setAnnotationMode(data[key]));
            }
        });
    }
});

/*
    required keys:
    userhash
*/
emitter.addListener(ATHEER_LISTENERS.PIN_PARTICIPANT, (data) => {
    logger.log('atheer jitsi receive ' + ATHEER_LISTENERS.PIN_PARTICIPANT + ' in emitter');
    if (Store && data != null) {
        Object.keys(data).forEach((key) => {
            if (key === ATHEER_LISTENER_KEYS.USERHASH) {
                logger.log('jitsi emitter receive key' + data[key]);
                if (_getJitsiParticipantId(data[key]) == 'localuser' || _getJitsiParticipantId(data[key]) == undefined) {
                    Store.dispatch(pinParticipant(null));
                    Store.dispatch(selectLocalParticipantInLargeVideo());
                } else {
                    Store.dispatch(pinParticipant(_getJitsiParticipantId(data[key])));
                }

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
    case CONFERENCE_FAILED:
        logger.log('jitsi info: CONFERENCE_FAILED');
        break;
    case CONFERENCE_JOINED:
        logger.log('jitsi info: CONFERENCE_JOINED');

        const state = store.getState();
        const { room } = state['features/base/conference'];
        const { loadableAvatarUrl, name, id } = getLocalParticipant(state);

        logger.log('jitsi info: CONFERENCE_JOINED room', room);
        logger.log('jitsi info: CONFERENCE_JOINED participant id ->' + id);
        logger.log('jitsi info: CONFERENCE_JOINED participant name ->' + name);
        logger.log('jitsi info: CONFERENCE_JOINED Atheer name ->' + _getAtheerUserhash(name));

        sendEvent(store, type,
        {
            jitsiParticipantId: id,
            jitsiParticipantDisplayName: name,
            atheerUser: _getAtheerUserhash(name)
        });
        break;
    case CONFERENCE_LEFT:
        logger.log('jitsi info: CONFERENCE_LEFT');
        jitsiHashDict = [];
        userHashDict = [];
        break;
    case CONFERENCE_WILL_JOIN:
        break;
    case CONNECTION_DISCONNECTED:
        logger.log('jitsi info: CONNECTION_DISCONNECTED');
        break;
    case PARTICIPANT_JOINED: {
        logger.log('jitsi info: PARTICIPANT_JOINED');

        const { participant: pInfo } = action;

        logger.log('jitsi info: participant id ->' + pInfo.id);
        logger.log('jitsi info: participant name ->' + pInfo.name);

        userHashDict[pInfo.id] = _getAtheerUserhash(pInfo.name);
        jitsiHashDict[pInfo.name] = pInfo.id;

        sendEvent(store, type,
        {
            jitsiParticipantId: pInfo.id,
            jitsiParticipantDisplayName: pInfo.name,
            atheerUser: userHashDict[pInfo.id]
        });
        break;
    }
    case PARTICIPANT_LEFT: {
        logger.log('jitsi info: PARTICIPANT_LEFT');

        const { participant: pInfo } = action;

        sendEvent(store, type,
        {
            jitsiParticipantId: pInfo.id,
            jitsiParticipantDisplayName: pInfo.name,
            atheerUser: userHashDict[pInfo.id]
        });
        break;
    }
    case NOTIFY_CONFERENCE_START_TIME:
        logger.log('jitsi info: NOTIFY_CONFERENCE_START_TIME');
        sendEvent(store, type,
        {
            startTime: action.time.toString()
        });
        break;
    case CONNECTION_FAILED:
        logger.log('jitsi info: CONNECTION_FAILED');
        break;
    case LOAD_CONFIG_ERROR:
        logger.log('jitsi info: LOAD_CONFIG_ERROR');
        break;
    case PIN_PARTICIPANT: {
        logger.log('jitsi info: PIN_PARTICIPANT');

        const { participant: pInfo } = action;

        sendEvent(store, type,
        {
            jitsiParticipantId: pInfo.id,
            jitsiParticipantDisplayName: pInfo.name,
            atheerUser: userHashDict[pInfo.id]
        });
        break;
    }
    case RECORDING_SESSION_UPDATED:
        logger.log('jitsi info: RECORDING_SESSION_UPDATED');

        const { sessionData: sData } = action;

        logger.log('jitsi info: RECORDING_SESSION_UPDATED id ->' + sData.id);
        logger.log('jitsi info: RECORDING_SESSION_UPDATED status ->' + sData.status);

        sendEvent(store, type,
        {
            id: sData.id,
            status: sData.status
        });
        break;
    case SET_ROOM:
        Store = store;
        break;
    }
    return result;
});

function _getAtheerUserhash(displayName) {
    if (!displayName || displayName == undefined) {
        return;
    }
    var splitParts = displayName.split(':');
    return splitParts[0];
}

function _getJitsiParticipantId(atheerUserhash) {
    for (var key in jitsiHashDict) {
        if (_getAtheerUserhash(key) == atheerUserhash) {
            return jitsiHashDict[key];
        }
    }
    return 'localuser';
}
