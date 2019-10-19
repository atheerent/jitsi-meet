// @flow
import { getAppProp } from '../base/app';
import { setLastN } from '../base/conference';
import {
        pinParticipant,
        PARTICIPANT_UPDATED
        } from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { SET_ROOM } from '../base/conference/actionTypes';
import { setFilmstripVisible,
        setFilmstripForceHidden,
        setGlassUi } from './actions';
import { selectParticipantInLargeVideo } from '../large-video/actions';
import { SET_FILMSTRIP_ENABLED,
        CLEAR_EXTENDED_TOOLS} from './actionTypes';

import Thumbnail from './components/native/Thumbnail';
import LargeVideo from '../large-video/components/LargeVideo.native';

const logger = require('jitsi-meet-logger').getLogger(__filename);

var Store: Object;

var RCTDeviceEventEmitter = require('RCTDeviceEventEmitter');

var ParticipantName; // this contains the users hash of the local user

RCTDeviceEventEmitter.addListener('setParticipantName', function(data) {
    Object.keys(data).forEach((key) => {
        if (key == 'userHash') {
            ParticipantName = data[key];
        }
    });
});

declare var APP: Object;

MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case SET_ROOM:
        Store = store;
        return _setRoom(store, next, action);
    case SET_FILMSTRIP_ENABLED:
        return _setFilmstripEnabled(store, next, action);
    }

    return next(action);
});

function _setRoom({ dispatch, getState }, next, action) {
    const state = getState();

    var remoteViewWidth = 100;
    var remoteViewHeight = 100;

    if (getAppProp(state, 'atheerInfo') != null) {
        remoteViewWidth = Number(getAppProp(state, 'atheerInfo').remoteVideoInfo.remoteViewWidth);
        remoteViewHeight = Number(getAppProp(state, 'atheerInfo').remoteVideoInfo.remoteViewHeight);
    }

    Thumbnail.setRemoteViewSize(remoteViewWidth, remoteViewHeight);
    dispatch(setFilmstripVisible(true));

    return next(action);
}

/**
 * Notifies the feature filmstrip that the action {@link SET_FILMSTRIP_ENABLED}
 * is being dispatched within a specific redux store.
 *
 * @param {Store} store - The redux store in which the specified action is being
 * dispatched.
 * @param {Dispatch} next - The redux dispatch function to dispatch the
 * specified action to the specified store.
 * @param {Action} action - The redux action {@code SET_FILMSTRIP_ENABLED} which
 * is being dispatched in the specified store.
 * @private
 * @returns {Object} The value returned by {@code next(action)}.
 */
function _setFilmstripEnabled({ dispatch, getState }, next, action) {
    const result = next(action);

    // FIXME The logic for participant pinning / unpinning is not on React yet
    // so dispatching the action is not enough. Hence, perform the following
    // only where it will be sufficient i.e. mobile.
    if (typeof APP === 'undefined') {
        const state = getState();
        const { enabled } = state['features/filmstrip'];
        const { audioOnly } = state['features/base/conference'];

        enabled || dispatch(pinParticipant(null));

        // FIXME Audio-only mode fiddles with lastN as well. That's why we don't
        // touch lastN in audio-only mode. But it's not clear what the value of
        // lastN should be upon exit from audio-only mode if the filmstrip is
        // disabled already. Currently, audio-only mode will set undefined
        // regardless of whether the filmstrip is disabled. But we don't have a
        // practical use case in which audio-only mode is exited while the
        // filmstrip is disabled.
        audioOnly || dispatch(setLastN(enabled ? undefined : 1));
    }

    return result;
}
