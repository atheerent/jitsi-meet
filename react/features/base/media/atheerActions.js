/* @flow */

import type { Dispatch } from 'redux';

import {
    TOGGLE_ATHEER_BUFFER,
    TOGGLE_FLASHLIGHT_ON,
    TOGGLE_FLASHLIGHT_OFF
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function toggleAtheerBuffer() {
    return {
        type: TOGGLE_ATHEER_BUFFER
    };
}

export function toggleFlashlightOn() {
    return {
        type: TOGGLE_FLASHLIGHT_ON
    };
}

export function toggleFlashlightOff() {
    return {
        type: TOGGLE_FLASHLIGHT_OFF
    };
}
