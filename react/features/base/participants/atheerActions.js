import { set } from '../redux';

import {
    SET_DISPLAY_NAME,
    SHOW_PARTICIPANT_TOOLS,
    HIDE_PARTICIPANT_TOOLS
} from './atheerActionTypes';

export function setParticipantDisplayName(displayName) {
    return {
        type: SET_DISPLAY_NAME,
        participant: {
            displayName
        }
    };
}

export function showParticipantTools(id) {
    return {
        type: SHOW_PARTICIPANT_TOOLS,
        participant: {
            id
        }
    };
}

export function hideParticipantTools(id) {
    return {
        type: HIDE_PARTICIPANT_TOOLS,
        participant: {
            id
        }
    };
}
