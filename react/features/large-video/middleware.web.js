// @flow

import { CONFERENCE_JOINED } from '../base/conference';
import {
    DOMINANT_SPEAKER_CHANGED,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    PIN_PARTICIPANT,
    getLocalParticipant
} from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import {
    getTrackByJitsiTrack,
    TRACK_ADDED,
    TRACK_REMOVED,
    TRACK_UPDATED
} from '../base/tracks';

import { selectParticipant, selectParticipantInLargeVideo } from './actions';
import { setPreviewTrack } from './components/LargeVideo.web';
import { SELECT_LARGE_VIDEO_PARTICIPANT } from './actionTypes';
import { getTrackByMediaTypeAndParticipant } from '../base/tracks';
import { MEDIA_TYPE } from '../base/media';

/**
 * Middleware that catches actions related to participants and tracks and
 * dispatches an action to select a participant depicted by LargeVideo.
 *
 * @param {Store} store - Redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
        case DOMINANT_SPEAKER_CHANGED: {
            // Disable Jitsi feature that shows the video feed of the dominant user (user with the higher volume)
            break;

            const localParticipant = getLocalParticipant(store.getState());

            if (localParticipant && localParticipant.id !== action.participant.id) {
                store.dispatch(selectParticipantInLargeVideo());
            }

            break;
        }

        case SELECT_LARGE_VIDEO_PARTICIPANT: {
            const state = store.getState();
            const tracks = state['features/base/tracks'];
            const id = action.participantId;
            const videoTrack = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.VIDEO, id);
            if (videoTrack !== undefined) {
                setPreviewTrack(videoTrack.jitsiTrack);
            }
            break;
        }

        case PARTICIPANT_JOINED:
        case PARTICIPANT_LEFT:
        case PIN_PARTICIPANT:
            store.dispatch(selectParticipantInLargeVideo());
            break;
        case TRACK_ADDED:
            const state = store.getState();
            const largeVideo = state['features/large-video'];
            const addedTrack = action.track;
            if (addedTrack.participantId === largeVideo.participantId && addedTrack.mediaType === MEDIA_TYPE.VIDEO) {
                setPreviewTrack(addedTrack.jitsiTrack);
            }
        case TRACK_REMOVED:
            store.dispatch(selectParticipantInLargeVideo());
            break;

        case CONFERENCE_JOINED:
            // Ensure a participant is selected on conference join. This addresses
            // the case where video tracks were received before CONFERENCE_JOINED
            // fired; without the conference selection may not happen.
            store.dispatch(selectParticipant());
            break;

        case TRACK_UPDATED:
            // In order to minimize re-calculations, we need to select participant
            // only if the videoType of the current participant rendered in
            // LargeVideo has changed.
            if ('videoType' in action.track) {
                const state = store.getState();
                const track
                    = getTrackByJitsiTrack(
                        state['features/base/tracks'],
                        action.track.jitsiTrack);
                const participantId = state['features/large-video'].participantId;

                (track.participantId === participantId)
                    && store.dispatch(selectParticipant());
            }
            break;
    }

    return result;
});
