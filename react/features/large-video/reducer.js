// @flow

import { PARTICIPANT_ID_CHANGED } from '../base/participants';
import { ReducerRegistry } from '../base/redux';

import {
    SELECT_LARGE_VIDEO_PARTICIPANT,
    UPDATE_KNOWN_LARGE_VIDEO_RESOLUTION,
    VIDEO_CALL_ZOOM
} from './actionTypes';

import { VIDEO_CALL_ZOOM_UPDATED,
        VIDEO_CALL_TOAST } from '../base/media';

ReducerRegistry.register('features/large-video', (state = {}, action) => {
    switch (action.type) {

    // When conference is joined, we update ID of local participant from default
    // 'local' to real ID. However, in large video we might have already
    // selected 'local' as participant on stage. So in this case we must update
    // ID of participant on stage to match ID in 'participants' state to avoid
    // additional changes in state and (re)renders.
    case PARTICIPANT_ID_CHANGED:
        if (state.participantId === action.oldValue) {
            return {
                ...state,
                participantId: action.newValue
            };
        }
        break;

    case SELECT_LARGE_VIDEO_PARTICIPANT:
        return {
            ...state,
            participantId: action.participantId
        };

    case UPDATE_KNOWN_LARGE_VIDEO_RESOLUTION:
        return {
            ...state,
            resolution: action.resolution
        };
        
    case VIDEO_CALL_ZOOM_UPDATED:
        return {
            ...state,
            toZoomParticipantId: action.participantId,
            toZoomParticipantLevel: action.transform.scale
        };

    case VIDEO_CALL_ZOOM:
        return {
            ...state,
            zoomParticipantId: action.participant.id,
            zoom: action.zoom,
            x: action.x,
            y: action.y
        };

    case VIDEO_CALL_TOAST:
        return {
            ...state,
            videoCallToast: action.show
        };
    }

    return state;
});
