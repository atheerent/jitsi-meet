// @flow

import { ReducerRegistry } from '../base/redux';

import {
    SET_FILMSTRIP_ENABLED,
    SET_FILMSTRIP_HOVERED,
    SET_FILMSTRIP_VISIBLE
} from './actionTypes';

import {
    SET_THUMBNAIL_STYLE,
    SET_FILMSTRIP_STYLE,
    SET_FILMSTRIP_HIDDEN
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
            /*
            Disable the meet default filmstrip visibility setup
            return {
                ...state,
                visible: action.visible
            };
            */
            return {
                ...state
            }

        case SET_THUMBNAIL_STYLE:
            return {
                ...state,
                thumbnailStyle: {
                    thumbnailWidth: action.thumbnailRadius,
                    thumbnailMarginBottom: action.thumbnailMarginBottom
                }
            };

        case SET_FILMSTRIP_STYLE:
            return {
                ...state,
                filmstripStyle: {
                    filmstripMarginTop: action.filmstripMarginTop,
                    filmstripMarginLeft: action.filmstripMarginLeft
                }
            };

        case SET_FILMSTRIP_HIDDEN:
            return {
                ...state,
                visible: !action.filmstripState
            };
        }

        return state;
    });
