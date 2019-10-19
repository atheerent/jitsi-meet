/**
 * The type of (redux) action which sets whether the filmstrip is enabled.
 *
 * {
 *     type: SET_FILMSTRIP_ENABLED,
 *     enabled: boolean
 * }
 */
export const SET_FILMSTRIP_ENABLED = 'SET_FILMSTRIP_ENABLED';

/**
 * The type of (redux) action which sets whether or not the filmstrip is being
 * hovered with the cursor.
 *
 * {
 *     type: SET_FILMSTRIP_HOVERED,
 *     hovered: boolean
 * }
 */
export const SET_FILMSTRIP_HOVERED = 'SET_FILMSTRIP_HOVERED';

/**
 * The type of (redux) action which sets whether the filmstrip is visible.
 *
 * {
 *     type: SET_FILMSTRIP_VISIBLE,
 *     visible: boolean
 * }
 */
export const SET_FILMSTRIP_VISIBLE = 'SET_FILMSTRIP_VISIBLE';

export const SET_FILMSTRIP_FORCE_HIDDEN = Symbol('SET_FILMSTRIP_FORCE_HIDDEN');

export const MUTE_MIC = 'MUTE_MIC';

export const TOGGLE_FLASHLIGHT = 'TOGGLE_FLASHLIGHT';

export const UPDATE_FLASHLIGHT_STATUS = Symbol('UPDATE_FLASHLIGHT_STATUS');

export const DISABLE_FLASHLIGHT = Symbol('DISABLE_FLASHLIGHT');

export const ENABLE_FLASHLIGHT = Symbol('ENABLE_FLASHLIGHT');

export const SET_DEVICE_TYPE = Symbol('SET_DEVICE_TYPE');
