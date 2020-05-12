// @flow

import React from 'react';
import { View } from 'react-native';
import type { Dispatch } from 'redux';

import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { openDialog } from '../../../base/dialog';
import { MEDIA_TYPE, VIDEO_TYPE } from '../../../base/media';
import {
    PARTICIPANT_ROLE,
    ParticipantView,
    getParticipantCount,
    isEveryoneModerator,
    pinParticipant
} from '../../../base/participants';
import { Container } from '../../../base/react';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { getTrackByMediaTypeAndParticipant } from '../../../base/tracks';
import { ConnectionIndicator } from '../../../connection-indicator';
//import { statsEmitter } from '../../../connection-indicator/statsEmitter';
import { DisplayNameLabel } from '../../../display-name';
import { RemoteVideoMenu } from '../../../remote-video-menu';
import { toggleToolboxVisible } from '../../../toolbox';

import AudioMutedIndicator from './AudioMutedIndicator';
import DominantSpeakerIndicator from './DominantSpeakerIndicator';
import ModeratorIndicator from './ModeratorIndicator';
import RaisedHandIndicator from './RaisedHandIndicator';
import styles, { AVATAR_SIZE } from './styles';
import atheerStyles from './atheerStyles';
import VideoMutedIndicator from './VideoMutedIndicator';

import { showConnectionStats } from '../../atheerActions';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export const DEFAULT_THUMBNAIL_RADIUS = 40;
export const DEFAULT_THUMBNAIL_MARGIN_BOTTOM = 10;

/**
 * Thumbnail component's property types.
 */
type Props = {

    /**
     * Whether local audio (microphone) is muted or not.
     */
    _audioMuted: boolean,

    /**
     * The Redux representation of the state "features/large-video".
     */
    _largeVideo: Object,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onClick: ?Function,

    /**
     * Handles long press on the thumbnail.
     */
    _onShowRemoteVideoMenu: ?Function,

    /**
     * Whether to show the dominant speaker indicator or not.
     */
    _renderDominantSpeakerIndicator: boolean,

    /**
     * Whether to show the moderator indicator or not.
     */
    _renderModeratorIndicator: boolean,

    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * The Redux representation of the participant's video track.
     */
    _videoTrack: Object,

    _thumbnailStyle?: Object,

    /**
     * If true, there will be no color overlay (tint) on the thumbnail
     * indicating the participant associated with the thumbnail is displayed on
     * large video. By default there will be a tint.
     */
    disableTint?: boolean,

    /**
     * Invoked to trigger state changes in Redux.
     */
    dispatch: Dispatch<any>,

    /**
     * The Redux representation of the participant to display.
     */
    participant: Object,

    /**
     * Whether to display or hide the display name of the participant in the thumbnail.
     */
    renderDisplayName: ?boolean,

    /**
     * Optional styling to add or override on the Thumbnail component root.
     */
    styleOverrides?: Object,

    /**
     * If true, it tells the thumbnail that it needs to behave differently. E.g. react differently to a single tap.
     */
    tileView?: boolean,

    index?: int
};

/**
 * React component for video thumbnail.
 *
 * @param {Props} props - Properties passed to this functional component.
 * @returns {Component} - A React component.
 */
function Thumbnail(props: Props) {
    const {
        _audioMuted: audioMuted,
        _largeVideo: largeVideo,
        _onClick,
        _onShowRemoteVideoMenu,
        _renderDominantSpeakerIndicator: renderDominantSpeakerIndicator,
        _renderModeratorIndicator: renderModeratorIndicator,
        _styles,
        _videoTrack: videoTrack,
        _thumbnailStyle,
        disableTint,
        participant,
        renderDisplayName,
        tileView,
        index
    } = props;

    var thumbnailDiameter = DEFAULT_THUMBNAIL_RADIUS * 2;
    var thumbnailStyleOverride = {
        borderRadius: 10,
        width: thumbnailDiameter,
        height: thumbnailDiameter,
        marginBottom: DEFAULT_THUMBNAIL_MARGIN_BOTTOM,
        marginLeft: index * (thumbnailDiameter + 10)
    }

    if (_thumbnailStyle && _thumbnailStyle.thumbnailRadius > 0) {
        thumbnailStyleOverride.borderRadius = _thumbnailStyle.thumbnailRadius;
        thumbnailStyleOverride.width = _thumbnailStyle.thumbnailRadius * 2;
        thumbnailStyleOverride.height = _thumbnailStyle.thumbnailRadius * 2;
    }

    /*if (_thumbnailStyle && _thumbnailStyle.thumbnailMarginBottom > 0) {
        thumbnailStyleOverride.marginBottom = _thumbnailStyle.thumbnailMarginBottom;
    }*/

    const participantId = participant.id;
    const participantInLargeVideo
        = participantId === largeVideo.participantId;
    const videoMuted = !videoTrack || videoTrack.muted;
    const isScreenShare = videoTrack && videoTrack.videoType === VIDEO_TYPE.DESKTOP;

    return (
            <Container
                onClick = { _onClick }
                onLongPress = { _onShowRemoteVideoMenu }
                style = { [
                    atheerStyles.atheerThumbnail, thumbnailStyleOverride,
                    participant.pinned && !tileView
                        ? _styles.thumbnailPinned : null,
                    null
                ] }
                touchFeedback = { false }>

                <ParticipantView
                    avatarSize = { 100 }
                    disableVideo = { isScreenShare }
                    participantId = { participantId }
                    style = { atheerStyles.atheerParticipantViewStyle }
                    tintEnabled = { participantInLargeVideo && !disableTint }
                    tintStyle = { _styles.activeThumbnailTint }
                    useCircleVideo = { true }
                    zOrder = { 1 }
                    isLargeVideo = { false } />

                <View>
                    <ConnectionIndicator participantId = { participantId }/>
                </View>

                { renderDisplayName && <DisplayNameLabel participantId = { participantId } /> }

                { audioMuted
                    && <Container style = { atheerStyles.muteAudioIndicatorContainer }>
                        <Container style = { atheerStyles.muteAudioIndicatorIcon }>
                            <AudioMutedIndicator />
                        </Container>
                </Container> }

            </Container>
    );
}

/**
 * Maps part of redux actions to component's props.
 *
 * @param {Function} dispatch - Redux's {@code dispatch} function.
 * @param {Props} ownProps - The own props of the component.
 * @returns {{
 *     _onClick: Function,
 *     _onShowRemoteVideoMenu: Function
 * }}
 */
function _mapDispatchToProps(dispatch: Function, ownProps): Object {
    return {
        /**
         * Handles click/tap event on the thumbnail.
         *
         * @protected
         * @returns {void}
         */
        _onClick() {
            const { participant } = ownProps;

            dispatch(pinParticipant(participant.id));
        },

        /**
         * Handles long press on the thumbnail.
         *
         * @returns {void}
         */
        _onShowRemoteVideoMenu() {
            const { participant } = ownProps;
            logger.log('deeep sending show connection stats event');
            dispatch(showConnectionStats('test value'));
        }
    };
}

/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @param {Props} ownProps - Properties of component.
 * @returns {Object}
 */
function _mapStateToProps(state, ownProps) {
    // We need read-only access to the state of features/large-video so that the
    // filmstrip doesn't render the video of the participant who is rendered on
    // the stage i.e. as a large video.
    const largeVideo = state['features/large-video'];
    const tracks = state['features/base/tracks'];
    const filmstrip = state['features/filmstrip'];
    const { participant } = ownProps;
    const id = participant.id;
    const audioTrack
        = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.AUDIO, id);
    const videoTrack
        = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.VIDEO, id);
    const participantCount = getParticipantCount(state);
    const renderDominantSpeakerIndicator = participant.dominantSpeaker && participantCount > 2;
    const _isEveryoneModerator = isEveryoneModerator(state);
    const renderModeratorIndicator = !_isEveryoneModerator && participant.role === PARTICIPANT_ROLE.MODERATOR;
    const thumbnailStyle = filmstrip.thumbnailStyle;

    return {
        _audioMuted: audioTrack?.muted ?? true,
        _largeVideo: largeVideo,
        _renderDominantSpeakerIndicator: renderDominantSpeakerIndicator,
        _renderModeratorIndicator: renderModeratorIndicator,
        _styles: ColorSchemeRegistry.get(state, 'Thumbnail'),
        _videoTrack: videoTrack,
        _thumbnailStyle: thumbnailStyle
    };
}

export default connect(_mapStateToProps, _mapDispatchToProps)(Thumbnail);
