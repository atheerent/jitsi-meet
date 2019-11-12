/* @flow */

import type { Dispatch } from 'redux';

import {
    TOGGLE_ATHEER_BUFFER
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * Action to adjust the availability of the local audio.
 *
 * @param {boolean} available - True if the local audio is to be marked as
 * available or false if the local audio is not available.
 * @returns {{
 *     type: SET_AUDIO_AVAILABLE,
 *     available: boolean
 * }}
 */
export function toggleAtheerBuffer() {
    return {
        type: TOGGLE_ATHEER_BUFFER
    };
}
