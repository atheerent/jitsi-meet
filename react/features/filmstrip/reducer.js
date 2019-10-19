// @flow

import { ReducerRegistry } from '../base/redux';

import {
    SET_FILMSTRIP_ENABLED,
    SET_FILMSTRIP_HOVERED,
    SET_FILMSTRIP_VISIBLE,
    SET_FILMSTRIP_FORCE_HIDDEN,
    TOGGLE_FLASHLIGHT,
    UPDATE_FLASHLIGHT_STATUS,
    ENABLE_FLASHLIGHT,
    DISABLE_FLASHLIGHT,
    SET_DEVICE_TYPE
} from './actionTypes';

import {
    SHOW_PARTICIPANT_TOOLS,
    HIDE_PARTICIPANT_TOOLS,
    PARTICIPANT_UPDATED
} from '../base/participants/actionTypes';

import { PARTICIPANT_JOINED } from '../base/participants';

const logger = require('jitsi-meet-logger').getLogger(__filename);

const DEFAULT_STATE = {
    /**
     * The indicator which determines whether the {@link Filmstrip} is enabled.
     *
     * @public
     * @type {boolean}
     */
    enabled: true,

    /**
     * The indicator which determines whether the {@link Filmstrip} is visible.
     *
     * @public
     * @type {boolean}
     */
    visible: true,
    showExtendedTools: false,
    extendedToolsParticipant: null,
    participantsFlashEnabled: null,
    participantsFlashOn: [],
    participantsFlashDisabled: [],
    reRender: false
};

ReducerRegistry.register(
    'features/filmstrip',
    (state = DEFAULT_STATE, action) => {
        switch (action.type) {
        case SET_FILMSTRIP_ENABLED:
            return {
                ...state,
                enabled: action.enabled
            };

        case SET_FILMSTRIP_HOVERED:
            return {
                ...state,

                /**
                 * The indicator which determines whether the {@link Filmstrip}
                 * is being hovered (over).
                 *
                 * @public
                 * @type {boolean}
                 */
                hovered: action.hovered
            };

        case SET_FILMSTRIP_VISIBLE:
            return {
                ...state,
                visible: action.visible
            };
            
        case SET_FILMSTRIP_FORCE_HIDDEN:
            return {
                ...state,
                forceHidden: action.forceHidden
            };

        case SET_DEVICE_TYPE:
            return {
                ...state,
                isGlass: action.isGlass
            };

        case SHOW_PARTICIPANT_TOOLS:
            return {
                ...state,
                extendedToolsParticipant: action.participant.id
            };

        case HIDE_PARTICIPANT_TOOLS:
            return {
                ...state,
                extendedToolsParticipant: action.participant.id
            };

        case PARTICIPANT_UPDATED:
            return {
                ...state
            };

        case TOGGLE_FLASHLIGHT:
            var participantsFlashOn = state.participantsFlashOn;
            if (action.participant.id) {
                if (participantsFlashOn.indexOf(action.participant.id) == -1 && action.flashlight) {
                    participantsFlashOn.push(action.participant.id);
                } else if (participantsFlashOn.indexOf(action.participant.id) != -1 && !action.flashlight) {
                    participantsFlashOn.splice(participantsFlashOn.indexOf(action.participant.id), 1);
                }
            }

            /*
            For some reason, the updated array of state does not trigger render() in thumbnail.
            Use a reRender variable and flip it value to trigger a render() in thumbnail,
            So the status of the icon could be updated properly
            */
            return {
                ...state,
                participantsFlashOn: participantsFlashOn,
                reRender: !state.reRender
            };

        case UPDATE_FLASHLIGHT_STATUS:
            var participantsFlashOn = state.participantsFlashOn;
            if (action.participant.id) {
                if (participantsFlashOn.indexOf(action.participant.id) == -1 && action.flashlightStatus) {
                    participantsFlashOn.push(action.participant.id);
                } else if (participantsFlashOn.indexOf(action.participant.id) != -1 && !action.flashlightStatus) {
                    participantsFlashOn.splice(participantsFlashOn.indexOf(action.participant.id), 1);
                }
            }

            return {
                ...state,
                participantsFlashOn: participantsFlashOn,
                reRender: !state.reRender
            };

        case ENABLE_FLASHLIGHT:
            var participantsFlashDisabled = state.participantsFlashDisabled;
            if (action.participant.id) {
                if (participantsFlashDisabled.indexOf(action.participant.id) != -1) {
                    participantsFlashDisabled.splice(participantsFlashDisabled.indexOf(action.participant.id), 1);
                }
            }

            return {
                ...state,
                participantsFlashDisabled: participantsFlashDisabled,
                reRender: !state.reRender
            };

        case DISABLE_FLASHLIGHT:
            var participantsFlashDisabled = state.participantsFlashDisabled;
            if (action.participant.id) {
                if (participantsFlashDisabled.indexOf(action.participant.id) == -1) {
                    participantsFlashDisabled.push(action.participant.id);
                }
            }

            /*
            For some reason, the updated array of state does not trigger render() in thumbnail.
            Use a reRender variable and flip it value to trigger a render() in thumbnail,
            So the status of the icon could be updated properly
            */
            return {
                ...state,
                participantsFlashDisabled: participantsFlashDisabled,
                reRender: !state.reRender
            };
        }

        return state;
    });
