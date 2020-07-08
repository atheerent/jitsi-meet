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
        height: 120,
        flexGrow: 0,
        right: 10
    },

    atheerParticipantViewStyle: {
        margin: 1,
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: '#E2E2E2',
        borderStyle: 'solid',
        borderWidth: 3
    },

    atheerThumbnail: {
        alignItems: 'stretch',
        flex: 1,
        justifyContent: 'center',
        backgroundColor : "#ffffff00",
        overflow: 'hidden',
        position: 'relative',
        padding: 5, 
        margin: 2
    },

    thumbnailContainer: {
        height: 100,
        width: 100,
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        margin: 2,
        overflow: 'visible',
        position: 'relative'
    },

    thumbnailVideo: {
        height: 100,
        width: 100
    },

    /**
     * The style of the scrollview containing the remote thumbnails.
     */
    scrollView: {
        flexGrow: 0,
        padding: 10
    },

    muteAudioIndicatorContainer: {
        alignSelf: 'stretch',
        bottom: 0,
        flex: 1,
        flexDirection: 'row',
        right: 0,
        position: 'absolute',
        backgroundColor : "#757575",
        height: 30,
        width: 30,
        borderRadius: 15,
        overflow: 'hidden',
        borderColor: '#E2E2E2',
        borderStyle: 'solid',
        borderWidth: 3
    },

    muteAudioIndicatorIcon: {
        marginLeft: 5,
        marginTop: 5
    }
};
