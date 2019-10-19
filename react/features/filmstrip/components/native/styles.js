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

    connectionIndicatorBackground: {
        backgroundColor: ColorPalette.brightGreen,
        borderRadius: 25,
        left: 4,
        padding: 7,
        position: 'absolute',
        top: 4
    },

    thumbnailToolBackground: {
        borderRadius: 28,
        padding: 28,
        margin: 3,
        marginLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },

    thumbnailToolBackgroundSmall: {
        borderRadius: 14,
        padding: 14,
        margin: 3,
        marginLeft: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },

    thumbnailToolBackgroundMedium: {
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
        marginLeft: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
    },

    marginLeftNegative: {
        marginLeft: -20
    },

    thumbnailToolBackgroundNormal: {
        backgroundColor: ColorPalette.whiteTrans,
    },

    thumbnailToolBackgroundHighlighted: {
        backgroundColor: ColorPalette.orangeTrans,
    },

    thumbnailToolBackgroundDark: {
        backgroundColor: ColorPalette.blackTrans,
    },

    thumbnailToolBackgroundAlert: {
        backgroundColor: ColorPalette.redTrans,
    },

    thumbnailToolBackgroundDisabled: {
        backgroundColor: ColorPalette.greyTrans,
    },

    thumbnailToolIcon: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        color: ColorPalette.black,
        fontSize: 25,
        position: 'absolute'
    },

    thumbnailToolIconNoraml: {
        color: ColorPalette.black,
    },

    thumbnailToolIconPressed: {
        color: ColorPalette.white,
    },

    /**
     * The style of the narrow {@link Filmstrip} version which displays
     * thumbnails in a row at the bottom of the screen.
     */
    filmstripNarrow: {
        flexDirection: 'row',
        flexGrow: 0,
        justifyContent: 'flex-end',
        height: FILMSTRIP_SIZE
    },

    /**
     * The style of the wide {@link Filmstrip} version which displays thumbnails
     * in a column on the short size of the screen.
     *
     * NOTE: width is calculated based on the children, but it should also align
     * to {@code FILMSTRIP_SIZE}.
     */
    filmstripWide: {
        bottom: 0,
        flexDirection: 'row',
        flexGrow: 0,
        position: 'absolute',
        justifyContent: 'flex-end',
        width: 500,
        right: 10,
        top: 10
    },

    /**
     * Container of the {@link LocalThumbnail}.
     */
    localThumbnail: {
    },

    moderatorIndicatorContainer: {
        bottom: 4,
        position: 'absolute',
        right: 4
    },

    /**
     * The style of the scrollview containing the remote thumbnails.
     */
    scrollView: {
        flexGrow: 0
    },

    /**
     * The style of a participant's Thumbnail which renders either the video or
     * the avatar of the associated participant.
     */
    thumbnail: {
        alignItems: 'stretch',
        backgroundColor: ColorPalette.appBackground,
        borderColor: '#424242',
        borderRadius: 0,
        borderStyle: 'solid',
        borderWidth: 1,
        flex: 1,
        height: 80,
        justifyContent: 'center',
        margin: 1,
        overflow: 'hidden',
        position: 'relative',
        width: 80
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
        height: 150,
        width: 110
    },

    thumbnailTools: {
        position: 'relative',
        height: 70,
        width: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    thumbnailToolsSmall: {
        position: 'relative',
        height: 35,
        width: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    thumbnailToolsTopMargin: {
        top: 10
    },

    thumbnailToolsMiddleMargin: {
        top: 5
    },

    /**
     * The thumbnails indicator container.
     */
    thumbnailIndicatorContainer: {
        alignSelf: 'stretch',
        bottom: 4,
        flex: 1,
        flexDirection: 'row',
        left: 4,
        position: 'absolute'
    },

    thumbnailTopIndicatorContainer: {
        padding: 4,
        position: 'absolute',
        top: 0
    },

    thumbnailTopLeftIndicatorContainer: {
        left: 0
    },

    thumbnailTopRightIndicatorContainer: {
        right: 0
    },

    tileView: {
        alignSelf: 'center'
    },

    tileViewRows: {
        justifyContent: 'center'
    },

    tileViewRow: {
        flexDirection: 'row',
        justifyContent: 'center'
    }
};

/**
 * Color schemed styles for the @{code Thumbnail} component.
 */
ColorSchemeRegistry.register('Thumbnail', {

    /**
     * Tinting style of the on-stage participant thumbnail.
     */
    activeThumbnailTint: {
        backgroundColor: schemeColor('activeParticipantTint')
    },

    /**
     * Coloring if the thumbnail background.
     */
    participantViewStyle: {
        backgroundColor: schemeColor('background')
    },

    /**
     * Pinned video thumbnail style.
     */
    thumbnailPinned: {
        borderColor: schemeColor('activeParticipantHighlight'),
        shadowColor: schemeColor('activeParticipantHighlight'),
        shadowOffset: {
            height: 5,
            width: 5
        },
        shadowRadius: 5
    }
});
