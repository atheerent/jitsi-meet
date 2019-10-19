/**
 * The application's definition of the default color black.
 */
const BLACK = '#111111';

/**
 * The application's color palette.
 */
export const ColorPalette = {
    /**
     * The application's background color.
     */
    appBackground: BLACK,

    /**
     * The application's definition of the default color black. Generally,
     * expected to be kept in sync with the application's background color for
     * the sake of consistency.
     */
    black: BLACK,
    blackBlue: 'rgb(0, 3, 6)',
    blue: '#17A0DB',
    blueHighlight: '#1081B2',
    buttonUnderlay: '#495258',
    darkGrey: '#555555',
    green: '#40B183',
    lightGrey: '#AAAAAA',
    overflowMenuItemUnderlay: '#EEEEEE',
    red: '#D00000',
    transparent: 'rgba(0, 0, 0, 0)',
    white: '#FFFFFF',
    whiteTrans: '#FFFFFFD0',
    orangeTrans: '#EEB560F0',
    redTrans: '#D00000E0',
    greyTrans: '#A0A1A3E0',
    brightGreen: '#6df07a',
    blackTrans: '#16231EE0',

    /**
     * These are colors from the atlaskit to be used on mobile, when needed.
     *
     * FIXME: Maybe a better solution would be good, or a native packaging of
     * the respective atlaskit components.
     */
    G400: '#00875A', // Slime
    N500: '#42526E', // McFanning
    R400: '#DE350B', // Red dirt
    Y200: '#FFC400' // Pub mix
};
