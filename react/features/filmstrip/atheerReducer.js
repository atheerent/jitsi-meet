// @flow

import { ReducerRegistry } from '../base/redux';

import {
    SET_FILMSTRIP_ENABLED,
    SET_FILMSTRIP_HOVERED,
    SET_FILMSTRIP_VISIBLE
} from './actionTypes';

import {
    SET_THUMBNAIL_SIZE
} from './atheerActionTypes';

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

    thumbnailStyle: {
        thumbnailWidth: 150,
        thumbnailHeight: 100
    }


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

        case SET_THUMBNAIL_SIZE:
            return {
                ...state,
                thumbnailStyle: {
                    thumbnailWidth: action.width,
                    thumbnailHeight: action.height
                }
            };
        }

        return state;
    });
