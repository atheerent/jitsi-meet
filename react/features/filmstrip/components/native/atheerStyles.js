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
        bottom: 0,
        flexDirection: 'row',
        flexGrow: 0,
        position: 'absolute',
        right: 0,
        justifyContent: 'flex-end',
        width: 500,
        right: 10,
        top: 0
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
    }
};
