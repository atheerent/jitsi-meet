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
import { MiddlewareRegistry } from '../base/redux';
import { appNavigate } from '../app/actions';
import { disconnect } from '../base/connection';
import { setThumbnailSize } from '../filmstrip/atheerActions'

import { sendEvent } from '../mobile/external-api/functions';

const logger = require('jitsi-meet-logger').getLogger(__filename);

const { RNEventEmitter } = NativeModules;
const emitter = new NativeEventEmitter(RNEventEmitter);

var userHashDict = {};
var jitsiHashDict = {};

var Store: Object;

// Atheer Emitters
emitter.addListener('hangUp', (data) => {
    logger.log('receive hangup in emitter');
    if (Store) {
        Store.dispatch(disconnect(true));
    }
});

/*
    required keys:
    width
    height
*/
emitter.addListener('setThumbnailSize', (data) => {
    logger.log('receive setThumbnailSize in emitter');
    if (Store && data != null) {
        var width = 0;
        var height = 0;
        Object.keys(data).forEach((key) => {
        if (key === 'width') {
            logger.log('jitsi emitter receive key' + data[key]);
            width = (data[key]);
        }
        if (key === 'height') {
            logger.log('jitsi emitter receive key' + data[key]);
            height = (data[key]);
        }
        if (width != 0 && height != 0) {
            Store.dispatch(setThumbnailSize(width, height));
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
        logger.log('hao check participant joined');
        logger.log('jitsi react emitter receive message participant_joined');
        userHashDict[action.participant.id] = action.participant.name;
        jitsiHashDict[action.participant.name] = action.participant.id;
        sendEvent(store, type,
        /* data */ {
            participantId: action.participant.id,
            userhash: _getAtheerUserhash(action.participant.name)
        });
        break;

    case PARTICIPANT_LEFT:
        logger.log('hao check participant left');
        logger.log('jitsi react emitter receive message participant_left');
        sendEvent(store, type,
        /* data */ {
            participantId: action.participant.id,
            userhash: _getAtheerUserhash(userHashDict[action.participant.id])
        });
        break;

    case CONNECTION_FAILED:
        break;

    case LOAD_CONFIG_ERROR: {
        break;
    }

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
