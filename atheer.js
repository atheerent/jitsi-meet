import {
    setAudioMuted,
    setVideoMuted
} from './react/features/base/media';
import { updateSettings } from './react/features/base/settings/actions';

export const displayNameSplit = ':';

export const ATHEER_MESSAGE = {
    TEST_MESSAGE: 'testMessage',
    CONFERENCE_INTIALIZED: 'conferenceInitialized',
    SET_DISPLAY_NAME: 'setDisplayName',
    PARTICIPANT_JOINED: 'participantJoined',
    PARTICIPANT_LEFT: 'participantLeft',
    MUTE_AUDIO: 'muteAudio',
    MUTE_VIDEO: 'muteVideo'
}

// Send message TO Atheer Storm
export function sendMessage(action, data) {
    console.log('ATHEER JITSI DEBUG: Send Message', action, data);
    window.parent.postMessage(JSON.stringify({
        atheerOrigin: 'jitsi',
        action: action,
        data: data
    }), '*');
}

// Receive message FROM Atheer Strom
window.addEventListener("message", onMessage, false);

function onMessage(event) {
    var receivedData;
    if (!event.data) {
        console.error('Message event contains no readable data.');
        return;
    }
    if (typeof event.data === 'object') {
        receivedData = event.data;
    } else {
        try {
            receivedData = JSON.parse(event.data);
        } catch (e) {
            receivedData = {};
            return;
        }
    }

    switch (receivedData.action) {
        // Switch the incoming messages
        case ATHEER_MESSAGE.SET_DISPLAY_NAME:
            var displayName = "Atheer User: LOCAL_USER";
            if (receivedData.data) {
                displayName = receivedData.data.userhash + displayNameSplit + receivedData.data.username;
            }
            APP.store.dispatch(updateSettings({displayName: displayName}));
            break;

        case ATHEER_MESSAGE.MUTE_AUDIO:
            var status = true;
            if (receivedData.data && receivedData.data.status === false) {
                status = false;
            }

            APP.store.dispatch(setAudioMuted(status));
            break;

        case ATHEER_MESSAGE.MUTE_VIDEO:
            var status = true;
            if (receivedData.data && receivedData.data.status === false) {
                status = false;
            }

            APP.store.dispatch(setVideoMuted(status));
            break;

        // ... other cases ...

        default:

    }
}

export function getUserHash(user) {
    var displayName = user.name ? user.name : user.getDisplayName();
    if (displayName) {
        var splitParts = displayName.split(displayNameSplit);
        return splitParts[0];
    }
    return "LOCAL_USER";
}
