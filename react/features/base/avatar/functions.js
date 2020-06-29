// @flow

import _ from 'lodash';
const logger = require('jitsi-meet-logger').getLogger(__filename);

const AVATAR_COLORS = [
    '232, 105, 156',
    '255, 198, 115',
    '128, 128, 255',
    '105, 232, 194',
    '234, 255, 128'
];

const AVATAR_OPACITY = 0.4;

/**
 * Generates the background color of an initials based avatar.
 *
 * @param {string?} initials - The initials of the avatar.
 * @returns {string}
 */
export function getAvatarColor(initials: ?string) {
    let colorIndex = 0;

    if (initials) {
        let nameHash = 0;

        for (const s of initials) {
            nameHash += s.codePointAt(0);
        }

        colorIndex = nameHash % AVATAR_COLORS.length;
    }

    return `rgba(${AVATAR_COLORS[colorIndex]}, ${AVATAR_OPACITY})`;
}

/**
 * Generates initials for a simple string.
 *
 * @param {string?} s - The string to generate initials for.
 * @returns {string?}
 */
export function getInitials(s: ?string) {
    // We don't want to use the domain part of an email address, if it is one
    logger.log('atheer-jitsi-debug trying to get initials', s);
    if (s != undefined) {
        var displayNameArray = s.split(':');
        if (displayNameArray.length > 1) {
            s = displayNameArray[1];
        }
    }
    let initials = '';

    if(s && s.length > 2) {
        var names = s.split(' ');
        names.forEach(name => {
            initials = initials ? initials.concat(name.charAt(0)) : name.charAt(0);
        });

        initials = initials.toUpperCase();
    } else {
        initials = s;
    }

    return initials;
}
