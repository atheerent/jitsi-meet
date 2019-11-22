// @flow
import { NativeEventEmitter, NativeModules } from 'react-native';
import {
    CONFERENCE_FAILED,
    CONFERENCE_JOINED,
    CONFERENCE_LEFT,
    CONFERENCE_WILL_JOIN,
    JITSI_CONFERENCE_URL_KEY,
    SET_ROOM,
    forEachConference,
    isRoomValid
} from '../../base/conference';
import {
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT
} from '../../base/participants'
import { MUTE_MIC,
        TOGGLE_FLASHLIGHT,
        OPEN_CHAT,
        SHARE_FILE,
        setGlassUi,
        setFilmstripVisible,
        setFilmstripForceHidden,
        updateFlashlightStatus,
        enableFlashlight,
        disableFlashlight } from '../../filmstrip'
import { LOAD_CONFIG_ERROR } from '../../base/config';
import {
    CONNECTION_DISCONNECTED,
    CONNECTION_FAILED,
    JITSI_CONNECTION_CONFERENCE_KEY,
    JITSI_CONNECTION_URL_KEY
} from '../../base/connection';
import { MiddlewareRegistry } from '../../base/redux';
import { toURLString } from '../../base/util';
import { ENTER_PICTURE_IN_PICTURE } from '../picture-in-picture';
import { appNavigate } from '../../app/actions';
import { disconnect } from '../../base/connection';

import { sendEvent } from './functions';

/**
 * Event which will be emitted on the native side to indicate the conference
 * has ended either by user request or because an error was produced.
 */
const CONFERENCE_TERMINATED = 'CONFERENCE_TERMINATED';

import { STORE_VIDEO_TRANSFORM, VIDEO_CALL_ZOOM_UPDATED } from '../../base/media';
import { selectParticipantInLargeVideo,
        videoCallZoom } from '../../large-video';

const logger = require('jitsi-meet-logger').getLogger(__filename);
const displayNameSplit = ':';

var userHashDict = {};
var jitsiHashDict = {};

var Store: Object;

var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var IsGlass = false;

const { RNEventEmitter } = NativeModules;

const emitter = new NativeEventEmitter(RNEventEmitter);

emitter.addListener(
    'hangUp',
    (data) => {
    logger.log('receive hangup in emitter');
    if (Store) {
        Store.dispatch(disconnect(true));
    }
});

RCTDeviceEventEmitter.addListener('showRemoteView', function(data) {
    Object.keys(data).forEach((key) => {
        if (key == 'userHash') {
            var jitsiId = _getJitsiParticipantId(data[key]);
            if (IsGlass) {
                Store.dispatch(setFilmstripVisible(true));
                if (jitsiId && !jitsiId.includes('localuser')) {
                    Store.dispatch(selectParticipantInLargeVideo(true, jitsiId));
                } else {
                    Store.dispatch(selectParticipantInLargeVideo(true));
                }
            } else {
                Store.dispatch(setFilmstripForceHidden(false));
                Store.dispatch(selectParticipantInLargeVideo(false));
            }

        }
    });
});

RCTDeviceEventEmitter.addListener('hideRemoteView', function() {
    if (IsGlass) {
        Store.dispatch(setFilmstripVisible(false));
    } else {
        Store.dispatch(setFilmstripForceHidden(true));
    }
    Store.dispatch(selectParticipantInLargeVideo(IsGlass));
});

RCTDeviceEventEmitter.addListener('setGlassUI', function() {
    IsGlass = true;
    Store.dispatch(setFilmstripVisible(false));
    Store.dispatch(setGlassUi(true));
    Store.dispatch(selectParticipantInLargeVideo(true));
});

emitter.addListener(
    'videoCallZoom',
    (data) => {
    if (Store) {
        var userhash = null;
        var zoom = null;
        var x = null;
        var y = null;
        if (data != null) {
            Object.keys(data).forEach((key) => {
                if (key === 'userhash') {
                    logger.log('Event:videoCallZoom userhash=' + data[key]);
                    userhash = _getJitsiParticipantId(data[key]);
                } else if (key === 'zoom') {
                    logger.log('Event:videoCallZoom zoom=' + data[key]);
                    zoom = data[key];
                } else if (key === 'x') {
                    logger.log('Event:videoCallZoom x=' + data[key]);
                    x = data[key];
                } else if (key === 'y') {
                    logger.log('Event:videoCallZoom y=' + data[key]);
                    y = data[key];
                }
            });
            Store.dispatch(videoCallZoom(userhash, zoom, x, y));
        }
    }
});

emitter.addListener(
    'disableFlashlight',
    (data) => {
    if (Store && data != null) {
        var userhash = null;
        Object.keys(data).forEach((key) => {
            if (key === 'userhash') {
                logger.log('Event:disableFlashlight userhash=' + data[key]);
                userhash = _getJitsiParticipantId(data[key]);
            }
        });
        Store.dispatch(disableFlashlight(userhash));
    }
});

emitter.addListener(
    'enableFlashlight',
    (data) => {
    if (Store && data != null) {
        var userhash = null;
        Object.keys(data).forEach((key) => {
            if (key === 'userhash') {
                logger.log('Event:enableFlashlight userhash=' + data[key]);
                userhash = _getJitsiParticipantId(data[key]);
            }
        });
        Store.dispatch(enableFlashlight(userhash));
    }
});

emitter.addListener(
    'updateFlashlightStatus',
    (data) => {
    if (Store && data != null) {
        var userhash = null;
        var flashlightStatus = null;
        Object.keys(data).forEach((key) => {
            if (key === 'userhash') {
                logger.log('Event:updateFlashlightStatus userhash=' + data[key]);
                userhash = _getJitsiParticipantId(data[key]);
            } else if (key === 'flashlightStatus') {
                logger.log('Event:updateFlashlightStatus flashlightStatus=' + data[key]);
                flashlightStatus = data[key];
            }
        });
        Store.dispatch(updateFlashlightStatus(userhash, flashlightStatus));
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
        const { error, ...data } = action;

        // XXX Certain CONFERENCE_FAILED errors are recoverable i.e. they have
        // prevented the user from joining a specific conference but the app may
        // be able to eventually join the conference. For example, the app will
        // ask the user for a password upon
        // JitsiConferenceErrors.PASSWORD_REQUIRED and will retry joining the
        // conference afterwards. Such errors are to not reach the native
        // counterpart of the External API (or at least not in the
        // fatality/finality semantics attributed to
        // conferenceFailed:/onConferenceFailed).
        if (!error.recoverable) {
            _sendConferenceEvent(store, /* action */ {
                error: _toErrorString(error),
                ...data
            });
        }
        break;
    }

    case CONFERENCE_LEFT:
        jitsiHashDict = [];
        userHashDict = [];
    case CONFERENCE_JOINED:
    case CONFERENCE_WILL_JOIN:
        _sendConferenceEvent(store, action);
        break;

    case CONNECTION_DISCONNECTED: {
        // FIXME: This is a hack. See the description in the JITSI_CONNECTION_CONFERENCE_KEY constant definition.
        // Check if this connection was attached to any conference. If it wasn't, fake a CONFERENCE_TERMINATED event.
        const { connection } = action;
        const conference = connection[JITSI_CONNECTION_CONFERENCE_KEY];

        if (!conference) {
            // This action will arrive late, so the locationURL stored on the state is no longer valid.
            const locationURL = connection[JITSI_CONNECTION_URL_KEY];

            sendEvent(
                store,
                CONFERENCE_TERMINATED,
                /* data */ {
                    url: toURLString(locationURL)
                });
        }

        break;
    }

    case CONNECTION_FAILED:
        !action.error.recoverable
            && _sendConferenceFailedOnConnectionError(store, action);
        break;

    case ENTER_PICTURE_IN_PICTURE:
        sendEvent(store, type, /* data */ {});
        break;

    case MUTE_MIC:
        sendEvent(store, type,
        /* data */ {
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case TOGGLE_FLASHLIGHT:
        sendEvent(store, type,
        /* data */ {
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case OPEN_CHAT:
        sendEvent(store, type,
        /* data */ {
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case SHARE_FILE:
        sendEvent(store, type,
        /* data */ {
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case PARTICIPANT_JOINED:
        userHashDict[action.participant.id] = action.participant.name;
        jitsiHashDict[action.participant.name] = action.participant.id;
        sendEvent(store, type,
        /* data */ {
            participantId: action.participant.id,
            userhash: _getAtheerUserhash(action.participant.name)
        });
        break;

    case PARTICIPANT_LEFT:
        sendEvent(store, type,
        /* data */ {
            participantId: action.participant.id,
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case VIDEO_CALL_ZOOM_UPDATED:
        var posX = action.transform.posX;
        if (!posX) {
            posX = 0.5;
        }
        var posY = action.transform.posY;
        if (!posY) {
            posY = 0.5;
        }
        sendEvent(store, type,
        /* data */ {
            userhash: _getAtheerUserhash(userHashDict[action.participantId]),
            zoom: action.transform.scale.toString(),
            x: posX.toString(),
            y: posY.toString()
        });
        break;

    case LOAD_CONFIG_ERROR: {
        const { error, locationURL } = action;

        sendEvent(
            store,
            CONFERENCE_TERMINATED,
            /* data */ {
                error: _toErrorString(error),
                url: toURLString(locationURL)
            });
        break;
    }

    case SET_ROOM:
        Store = store;
        _maybeTriggerEarlyConferenceWillJoin(store, action);
        break;
    }

    return result;
});

/**
 * Returns a {@code String} representation of a specific error {@code Object}.
 *
 * @param {Error|Object|string} error - The error {@code Object} to return a
 * {@code String} representation of.
 * @returns {string} A {@code String} representation of the specified
 * {@code error}.
 */
function _toErrorString(
        error: Error | { message: ?string, name: ?string } | string) {
    // XXX In lib-jitsi-meet and jitsi-meet we utilize errors in the form of
    // strings, Error instances, and plain objects which resemble Error.
    return (
        error
            ? typeof error === 'string'
                ? error
                : Error.prototype.toString.apply(error)
            : '');
}

/**
 * If {@link SET_ROOM} action happens for a valid conference room this method
 * will emit an early {@link CONFERENCE_WILL_JOIN} event to let the external API
 * know that a conference is being joined. Before that happens a connection must
 * be created and only then base/conference feature would emit
 * {@link CONFERENCE_WILL_JOIN}. That is fine for the Jitsi Meet app, because
 * that's the a conference instance gets created, but it's too late for
 * the external API to learn that. The latter {@link CONFERENCE_WILL_JOIN} is
 * swallowed in {@link _swallowEvent}.
 *
 * @param {Store} store - The redux store.
 * @param {Action} action - The redux action.
 * @returns {void}
 */
function _maybeTriggerEarlyConferenceWillJoin(store, action) {
    const { locationURL } = store.getState()['features/base/connection'];
    const { room } = action;

    isRoomValid(room) && locationURL && sendEvent(
        store,
        CONFERENCE_WILL_JOIN,
        /* data */ {
            url: toURLString(locationURL)
        });
}

/**
 * Sends an event to the native counterpart of the External API for a specific
 * conference-related redux action.
 *
 * @param {Store} store - The redux store.
 * @param {Action} action - The redux action.
 * @returns {void}
 */
function _sendConferenceEvent(
        store: Object,
        action: {
            conference: Object,
            type: string,
            url: ?string
        }) {
    const { conference, type, ...data } = action;

    // For these (redux) actions, conference identifies a JitsiConference
    // instance. The external API cannot transport such an object so we have to
    // transport an "equivalent".
    if (conference) {
        data.url = toURLString(conference[JITSI_CONFERENCE_URL_KEY]);
    }

    if (_swallowEvent(store, action, data)) {
        return;
    }

    let type_;

    switch (type) {
    case CONFERENCE_FAILED:
    case CONFERENCE_LEFT:
        type_ = CONFERENCE_TERMINATED;
        break;
    default:
        type_ = type;
        break;
    }

    sendEvent(store, type_, data);
}

/**
 * Sends {@link CONFERENCE_TERMINATED} event when the {@link CONNECTION_FAILED}
 * occurs. It should be done only if the connection fails before the conference
 * instance is created. Otherwise the eventual failure event is supposed to be
 * emitted by the base/conference feature.
 *
 * @param {Store} store - The redux store.
 * @param {Action} action - The redux action.
 * @returns {void}
 */
function _sendConferenceFailedOnConnectionError(store, action) {
    const { locationURL } = store.getState()['features/base/connection'];
    const { connection } = action;

    locationURL
        && forEachConference(
            store,

            // If there's any conference in the  base/conference state then the
            // base/conference feature is supposed to emit a failure.
            conference => conference.getConnection() !== connection)
        && sendEvent(
        store,
        CONFERENCE_TERMINATED,
        /* data */ {
            url: toURLString(locationURL),
            error: action.error.name
        });
}

/**
 * Determines whether to not send a {@code CONFERENCE_LEFT} event to the native
 * counterpart of the External API.
 *
 * @param {Object} store - The redux store.
 * @param {Action} action - The redux action which is causing the sending of the
 * event.
 * @param {Object} data - The details/specifics of the event to send determined
 * by/associated with the specified {@code action}.
 * @returns {boolean} If the specified event is to not be sent, {@code true};
 * otherwise, {@code false}.
 */
function _swallowConferenceLeft({ getState }, action, { url }) {
    // XXX Internally, we work with JitsiConference instances. Externally
    // though, we deal with URL strings. The relation between the two is many to
    // one so it's technically and practically possible (by externally loading
    // the same URL string multiple times) to try to send CONFERENCE_LEFT
    // externally for a URL string which identifies a JitsiConference that the
    // app is internally legitimately working with.
    let swallowConferenceLeft = false;

    url
        && forEachConference(getState, (conference, conferenceURL) => {
            if (conferenceURL && conferenceURL.toString() === url) {
                swallowConferenceLeft = true;
            }

            return !swallowConferenceLeft;
        });

    return swallowConferenceLeft;
}

/**
 * Determines whether to not send a specific event to the native counterpart of
 * the External API.
 *
 * @param {Object} store - The redux store.
 * @param {Action} action - The redux action which is causing the sending of the
 * event.
 * @param {Object} data - The details/specifics of the event to send determined
 * by/associated with the specified {@code action}.
 * @returns {boolean} If the specified event is to not be sent, {@code true};
 * otherwise, {@code false}.
 */
function _swallowEvent(store, action, data) {
    switch (action.type) {
    case CONFERENCE_LEFT:
        return _swallowConferenceLeft(store, action, data);
    case CONFERENCE_WILL_JOIN:
        // CONFERENCE_WILL_JOIN is dispatched to the external API on SET_ROOM,
        // before the connection is created, so we need to swallow the original
        // one emitted by base/conference.
        return true;

    default:
        return false;
    }
}

// TODO(Hao): Remove this function once Web jitsi and Android jitsi is merged
function _getAtheerUserhash(fullUsername) {
    if (!fullUsername || fullUsername == undefined) {
        return;
    }
    var splitParts = fullUsername.split(displayNameSplit);
    if (splitParts.length > 1) {
        return splitParts[1];
    }
}

function _getJitsiParticipantId(atheerUserhash) {
    for (var key in jitsiHashDict) {
        if (_getAtheerUserhash(key) == atheerUserhash) {
            return jitsiHashDict[key];
        }
    }
    return 'localuser';
}
