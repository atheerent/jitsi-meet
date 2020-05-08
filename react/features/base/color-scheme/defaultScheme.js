// @flow

import { ColorPalette, getRGBAFormat } from '../styles';

/**
 * The default color scheme of the application.
 */
export default {
    'BottomSheet': {
        background: ColorPalette.blackBlue,
        icon: ColorPalette.white,
        label: ColorPalette.white
    },
    'Dialog': {
        background: ColorPalette.white,
        border: getRGBAFormat(ColorPalette.white, 0.2),
        buttonBackground: ColorPalette.atheerGreen,
        buttonLabel: ColorPalette.white,
        icon: ColorPalette.white,
        text: ColorPalette.black
    },
    'Header': {
        background: ColorPalette.blue,
        icon: ColorPalette.white,
        statusBar: ColorPalette.blueHighlight,
        statusBarContent: ColorPalette.white,
        text: ColorPalette.white
    },
    'LargeVideo': {
        background: ColorPalette.black
    },
    'LoadConfigOverlay': {
        background: ColorPalette.black,
        text: ColorPalette.white
    },
    'Thumbnail': {
        activeParticipantHighlight: ColorPalette.blue,
        activeParticipantTint: ColorPalette.black,
        background: ColorPalette.black
    },
    'Toolbox': {
        button: getRGBAFormat(ColorPalette.white, 0.7),
        buttonToggled: getRGBAFormat(ColorPalette.buttonUnderlay, 0.7),
        buttonToggledBorder:
            getRGBAFormat(ColorPalette.buttonUnderlay, 0.7),
        hangup: ColorPalette.red
    }
};
