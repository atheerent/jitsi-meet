// @flow

import { ColorSchemeRegistry, schemeColor } from '../../../base/color-scheme';
import { ColorPalette } from '../../../base/styles';

import { FILMSTRIP_SIZE } from '../../constants';

/**
 * Size for the Avatar.
 */
export const AVATAR_SIZE = 50;

/**
 * The styles of the feature filmstrip.
 */
export default {

    atheerFilmstripWide: {
        position: 'absolute',
        width: 150,
        left: 10,
        top: 10
    },

    atheerParticipantViewStyle: {
        borderRadius: 100,
        overflow: 'hidden'
    },

    atheerThumbnail: {
        alignItems: 'stretch',
        backgroundColor: ColorPalette.appBackground,
        borderColor: '#424242',
        borderRadius: 3,
        borderStyle: 'solid',
        borderWidth: 1,
        flex: 1,
        height: 100,
        width: 100,
        borderRadius: 50,
        justifyContent: 'center',
        margin: 2,
        overflow: 'hidden',
        position: 'relative'
    },

    thumbnailContainer: {
        height: 100,
        width: 100,
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: 2,
        overflow: 'hidden',
        position: 'relative'
    },

    thumbnailVideo: {
        height: 100,
        width: 100
    }
};
