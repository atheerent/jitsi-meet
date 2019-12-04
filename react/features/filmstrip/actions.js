// @flow

import {
    SET_FILMSTRIP_ENABLED,
    SET_FILMSTRIP_HOVERED,
    SET_FILMSTRIP_VISIBLE,
    SET_FILMSTRIP_FORCE_HIDDEN,
    MUTE_MIC,
    OPEN_CHAT,
    SHARE_FILE,
    TOGGLE_FLASHLIGHT,
    UPDATE_FLASHLIGHT_STATUS,
    ENABLE_FLASHLIGHT,
    DISABLE_FLASHLIGHT,
    SET_DEVICE_TYPE, 
    IS_EXTERNAL_SESSION
} from './actionTypes';

/**
 * Sets whether the filmstrip is enabled.
 *
 * @param {boolean} enabled - Whether the filmstrip is enabled.
 * @returns {{
 *     type: SET_FILMSTRIP_ENABLED,
 *     enabled: boolean
 * }}
 */
export function setFilmstripEnabled(enabled: boolean) {
    return {
        type: SET_FILMSTRIP_ENABLED,
        enabled
    };
}

/**
 * Sets whether the filmstrip is being hovered (over).
 *
 * @param {boolean} hovered - Whether the filmstrip is being hovered (over).
 * @returns {{
 *     type: SET_FILMSTRIP_HOVERED,
 *     hovered: boolean
 * }}
 */
export function setFilmstripHovered(hovered: boolean) {
    return {
        type: SET_FILMSTRIP_HOVERED,
        hovered
    };
}

/**
 * Sets whether the filmstrip is visible.
 *
 * @param {boolean} visible - Whether the filmstrip is visible.
 * @returns {{
 *     type: SET_FILMSTRIP_VISIBLE,
 *     visible: boolean
 * }}
 */
export function setFilmstripVisible(visible: boolean) {
    return {
        type: SET_FILMSTRIP_VISIBLE,
        visible
    };
}

export function setFilmstripForceHidden(forceHidden: boolean) {
    return {
        type: SET_FILMSTRIP_FORCE_HIDDEN,
        forceHidden
    };
}

export function muteMic(id) {
    return {
        type: MUTE_MIC,
        participant: {
            id
        }
    };
}

export function toggleFlashlight(id, flashlight: boolean) {
    return {
        type: TOGGLE_FLASHLIGHT,
        participant: {
            id
        },
        flashlight
    };
}

export function openChat(id) {
    return {
        type: OPEN_CHAT,
        participant: {
            id
        }
    };
}

export function shareFile(id) {
    return {
        type: SHARE_FILE,
        participant: {
            id
        }
    };
}

export function updateFlashlightStatus(id, flashlightStatus: boolean) {
    return {
        type: UPDATE_FLASHLIGHT_STATUS,
        participant: {
            id
        },
        flashlightStatus
    };
}

export function disableFlashlight(id) {
    return {
        type: DISABLE_FLASHLIGHT,
        participant: {
            id
        }
    };
}

export function enableFlashlight(id) {
    return {
        type: ENABLE_FLASHLIGHT,
        participant: {
            id
        }
    };
}

export function setGlassUi(isGlass: boolean) {
    return {
        type: SET_DEVICE_TYPE,
        isGlass
    };
}

export function setExternalSessionStatus(isExternalSession: boolean) {
    return {
        type: IS_EXTERNAL_SESSION,
        isExternalSession
    };
}