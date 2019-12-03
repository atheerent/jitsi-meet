import {
    setAudioMuted,
    setVideoMuted
} from './react/features/base/media';

export const ATHEER_MESSAGE = {
    TEST_MESSAGE: 'testMessage',
    CONFERENCE_INTIALIZED: 'conferenceInitialized',
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

// TODO(Sanjay or Hao): Define userhash to participant mapping in Jitsi,
// and return the proper userhash.
export function getUserHash(user) {
    return "LOCAL_USER";
}
