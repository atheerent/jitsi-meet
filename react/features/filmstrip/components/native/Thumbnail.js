// @flow

import React, { Component } from 'react';
import { View, Image } from 'react-native';
import type { Dispatch } from 'redux';
import { Icon } from '../../../base/font-icons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import { ColorSchemeRegistry } from '../../../base/color-scheme';
import { openDialog } from '../../../base/dialog';
import { Audio, MEDIA_TYPE } from '../../../base/media';
import {
    PARTICIPANT_ROLE,
    ParticipantView,
    isEveryoneModerator,
    pinParticipant,
    showParticipantTools,
    hideParticipantTools,
    getParticipantDisplayName
} from '../../../base/participants';
import { Container } from '../../../base/react';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import { getTrackByMediaTypeAndParticipant } from '../../../base/tracks';
import { ConnectionIndicator } from '../../../connection-indicator';
import { DisplayNameLabel } from '../../../display-name';
import { RemoteVideoMenu } from '../../../remote-video-menu';
import { toggleToolboxVisible } from '../../../toolbox';

import AudioMutedIndicator from './AudioMutedIndicator';
import DominantSpeakerIndicator from './DominantSpeakerIndicator';
import ModeratorIndicator from './ModeratorIndicator';
import RaisedHandIndicator from './RaisedHandIndicator';
import styles, { AVATAR_SIZE } from './styles';
import VideoMutedIndicator from './VideoMutedIndicator';
import { selectParticipant, selectParticipantInLargeVideo } from '../../../large-video/actions';
import { muteMic, toggleFlashlight, setFilmstripVisible } from '../../actions';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export const DEFAULT_THUMBNAIL_HEIGHT = 80;
export const DEFAULT_THUMBNAIL_WIDTH = 100;

/**
 * Thumbnail component's property types.
 */
type Props = {

    /**
     * The Redux representation of the participant's audio track.
     */
    _audioTrack: Object,

    /**
     * True if everone in the meeting is moderator.
     */
    _isEveryoneModerator: boolean,

    /**
     * The Redux representation of the state "features/large-video".
     */
    _largeVideo: Object,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onClick: ?Function,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onPress: ?Function,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onShowTools: ?Function,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onHideTools: ?Function,

    /**
     * Handles click/tap event on the thumbnail.
     */
    _onClickMute: ?Function,


    /**
     * Handles click/tap event on the thumbnail.
     */
    _onClickFlashlight: ?Function,


    /**
     * Handles click/tap event on the thumbnail.
     */
    _onSwipeRight: ?Function,

    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * The Redux representation of the participant's video track.
     */
    _videoTrack: Object,

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

    extendedToolsParticipant: Object,

    participantsFlashOn: Object,

    _reRedner: Object,

    allowToolTips: Object,

    _hasTorch: Object,

    _fromZoomParticipantId: Object,

    _fromZoomParticipantLevel: Object,

    _toZoomParticipantId: Object,

    _toZoomParticipantLevel: Object
};

/**
 * React component for video thumbnail.
 *
 * @extends Component
 */
class Thumbnail extends Component<Props> {

    /**
     * Initializes new Video Thumbnail component.
     *
     * @param {Object} props - Component props.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onClick = this._onClick.bind(this);
        this._onPress = this._onPress.bind(this);
        this._onClickMute = this._onClickMute.bind(this);
        this._onClickFlashlight = this._onClickFlashlight.bind(this);
        this._onSwipeRight = this._onSwipeRight.bind(this);
        this._onShowTools = this._onShowTools.bind(this);
        this._onHideTools = this._onHideTools.bind(this);
    }
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _audioTrack: audioTrack,
            _isEveryoneModerator,
            _largeVideo: largeVideo,
            _styles,
            _videoTrack: videoTrack,
            disableTint,
            participant,
            renderDisplayName,
            tileView,
            extendedToolsParticipant: extendedToolsParticipant,
            participantsFlashOn: participantsFlashOn,
            _reRedner: _reRedner,
            allowToolTips: allowToolTips,
            _hasTorch: _hasTorch,
            _fromZoomParticipantId: _fromZoomParticipantId,
            _fromZoomParticipantLevel: _fromZoomParticipantLevel,
            _toZoomParticipantId: _toZoomParticipantId,
            _toZoomParticipantLevel: _toZoomParticipantLevel
        } = this.props;

        let style = styles.thumbnail;
        let styleDimension = {
            width: DEFAULT_THUMBNAIL_WIDTH,
            height: DEFAULT_THUMBNAIL_HEIGHT
        }

        // We don't render audio in any of the following:
        // 1. The audio (source) is muted. There's no practical reason (that we
        //    know of, anyway) why we'd want to render it given that it's
        //    silence (& not even comfort noise).
        // 2. The audio is local. If we were to render local audio, the local
        //    participants would be hearing themselves.
        const audioMuted = !audioTrack || audioTrack.muted;
        const renderAudio = !audioMuted && !audioTrack.local;
        const participantId = participant.id;
        const participantInLargeVideo
            = participantId === largeVideo.participantId;
        const participantNotInLargeVideo
            = participantId !== largeVideo.participantId;
        const videoMuted = !videoTrack || videoTrack.muted;

        const showTools = extendedToolsParticipant == participantId;

        const flashlightOn = participantsFlashOn && participantsFlashOn.indexOf(participantId) != -1;

        const config = {
            velocityThreshold: 0.1,
            directionalOffsetThreshold: 30
        };

        const hasTorch = this.props._hasTorch;

        const fromZoomParticipantId = _fromZoomParticipantId;
        const fromZoomParticipantLevel = _fromZoomParticipantLevel;
        const toZoomParticipantId = _toZoomParticipantId;
        const toZoomParticipantLevel = _toZoomParticipantLevel;

        // If someone else is zooming, show zoom disabled on the corresponding thumbnail.
        var fromZoomDisabled = false;
        if ((fromZoomParticipantId == participantId && fromZoomParticipantLevel > 1) ||
            (fromZoomParticipantId == 'localuser' && fromZoomParticipantLevel > 1 && participant.local)) {
            fromZoomDisabled = true;
        }

        // If device user is zooming, show zooming active on the corresponding thumbnail.
        var toZoomDisabled = false;
        if (toZoomParticipantId == participantId && toZoomParticipantLevel > 1) {
            toZoomDisabled = true;
        }

        return (
          <Container style = { styles.thumbnailContainer }>
                <GestureRecognizer
                  onSwipeRight={this._onSwipeRight}
                  config={config} >
                    <Container
                        onClick = { this._onClick }
                        onPress = { this._onPress }
                        style = { [
                            style, styleDimension,
                            participant.pinned && !tileView
                                ? _styles.thumbnailPinned : null,
                            this.props.styleOverrides || null
                        ] }>

                        { renderAudio
                            && <Audio
                                stream
                                    = { audioTrack.jitsiTrack.getOriginalStream() } /> }

                          <ParticipantView
                              avatarSize = { AVATAR_SIZE }
                              participantId = { participantId }
                              showAvatar = { participantNotInLargeVideo }
                              showVideo = { true }
                              zOrder = { 1 }
                              isLargeVideo = { false } />

                        {
                          fromZoomDisabled && <View style = { [ styles.thumbnailToolBackgroundMedium,
                                  styles.thumbnailToolBackgroundDisabled ] }>
                              <Icon
                                  name = 'Disabled-Zooming'
                                  style = { [ styles.thumbnailToolIcon,
                                              styles.thumbnailToolIconPressed ] } />
                            </View>
                        }
                        {
                          toZoomDisabled && <View style = { [ styles.thumbnailToolBackgroundMedium,
                              styles.thumbnailToolBackgroundHighlighted ] }>
                                <Icon
                                    name = 'Active-Zooming'
                                    style = { [ styles.thumbnailToolIcon,
                                                styles.thumbnailToolIconPressed ] } />
                            </View>
                        }
                        <Container style = { styles.thumbnailIndicatorContainer }>
                            { audioMuted
                                && <AudioMutedIndicator /> }

                            { videoMuted
                                && <VideoMutedIndicator /> }
                        </Container>
                    </Container>
                </GestureRecognizer>
                {
                    allowToolTips && !showTools && <Container
                        onClick = { this._onShowTools }
                        style = { [ styles.thumbnailToolsSmall, styles.thumbnailToolsTopMargin ] }>
                        <View style = { [ styles.thumbnailToolBackgroundSmall, styles.thumbnailToolBackgroundDark ] }
                            onPress = { this._onShowTools }>
                            <Icon name = 'atheer-menu-down'
                            style = { [ styles.thumbnailToolIcon, styles.thumbnailToolIconPressed ] } />
                        </View>
                    </Container>
                }
                {
                    allowToolTips && showTools && <Container
                        onClick = { this._onHideTools }
                        style = { [ styles.thumbnailToolsSmall, styles.thumbnailToolsTopMargin ] }>
                        <View style = { [ styles.thumbnailToolBackgroundSmall, styles.thumbnailToolBackgroundDark ] }
                            onPress = { this._onHideTools }>
                            <Icon name = 'atheer-menu-up'
                            style = { [ styles.thumbnailToolIcon, styles.thumbnailToolIconPressed ] } />
                        </View>
                    </Container>
                }
                {
                    showTools && <View>
                        <Container
                            onClick = { this._onClickMute }
                            style = { [ styles.thumbnailTools, styles.thumbnailToolsTopMargin ] }>
                            <View style = { [ styles.thumbnailToolBackground,
                                            audioMuted ? styles.thumbnailToolBackgroundDisabled : styles.thumbnailToolBackgroundNormal ] }
                                onPress = { this._onClickMute }>
                                <Icon name = 'atheer-mic'
                                style = { [ styles.thumbnailToolIcon,
                                        audioMuted ? styles.thumbnailToolIconPressed : styles.thumbnailToolIconNoraml ] } />
                            </View>
                        </Container>
                        <Container
                            onClick = { this._onClickFlashlight }
                            style = { [ styles.thumbnailTools, styles.thumbnailToolsMiddleMargin ] }>
                            <View style = { [ styles.thumbnailToolBackground,
                                            !hasTorch ? styles.thumbnailToolBackgroundDisabled : null,
                                            (hasTorch && flashlightOn) ? styles.thumbnailToolBackgroundHighlighted : null,
                                            (hasTorch && !flashlightOn) ? styles.thumbnailToolBackgroundNormal : null ] }
                                onPress = { this._onClickFlashlight } >
                                <Icon name = 'atheer-flashlight'
                                style = { [ styles.thumbnailToolIcon,
                                            (flashlightOn || !hasTorch) ? styles.thumbnailToolIconPressed : styles.thumbnailToolIconNoraml ] } />
                            </View>
                        </Container>
                    </View>
                }
            </Container>
        );
    }

    /**
     * Handles click/tap event on the thumbnail.
     *
     * @returns {void}
     */
    _onClick() {
        const { dispatch, participant } = this.props;

        dispatch(pinParticipant(participant.id));
        dispatch(selectParticipantInLargeVideo());
    }

    _onPress() {
        const { dispatch, participant } = this.props;

        dispatch(showParticipantTools(participant.id));
    }

    _onShowTools() {
        const { dispatch, participant } = this.props;

        dispatch(showParticipantTools(participant.id));
    }

    _onHideTools() {
        const { dispatch, participant } = this.props;

        dispatch(hideParticipantTools(null));
    }

    _onClickMute() {
        const { dispatch, participant } = this.props;

        const audioTrack = this.props._audioTrack;
        const audioMuted = !audioTrack || audioTrack.muted;

        if (!audioMuted) {
            dispatch(muteMic(participant.id));
        }

    }

    _onClickFlashlight() {
        const { dispatch, participant } = this.props;

        const participantsFlashOn = this.props.participantsFlashOn;
        const participantId = participant.id;
        const flashlightOn = participantsFlashOn && participantsFlashOn.indexOf(participantId) != -1;

        dispatch(toggleFlashlight(participant.id, !flashlightOn));
    }

    _onSwipeRight(gestureState) {
        const { dispatch, participant } = this.props;

        dispatch(setFilmstripVisible(false));
    }

    static setRemoteViewSize(width, height) {
        Thumbnail.remoteViewWidth = DEFAULT_THUMBNAIL_WIDTH;
        Thumbnail.remoteViewHeight = DEFAULT_THUMBNAIL_HEIGHT;
    }
}



/**
 * Function that maps parts of Redux state tree into component props.
 *
 * @param {Object} state - Redux state.
 * @param {Props} ownProps - Properties of component.
 * @returns {{
 *      _audioTrack: Track,
 *      _largeVideo: Object,
 *      _styles: StyleType,
 *      _videoTrack: Track
 *  }}
 */
function _mapStateToProps(state, ownProps) {
    // We need read-only access to the state of features/large-video so that the
    // filmstrip doesn't render the video of the participant who is rendered on
    // the stage i.e. as a large video.
    const largeVideo = state['features/large-video'];
    const tracks = state['features/base/tracks'];
    const { participantsFlashOn, reRender, participantsFlashDisabled } = state['features/filmstrip'];
    const id = ownProps.participant.id;
    const name = ownProps.participant.name;
    var hasTorch = false;
    if (name && !name.includes('Admin')) {
        hasTorch = true;
    }
    if (participantsFlashDisabled && participantsFlashDisabled.indexOf(id) != -1) {
        hasTorch = false;
    }
    const audioTrack
        = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.AUDIO, id);
    const videoTrack
        = getTrackByMediaTypeAndParticipant(tracks, MEDIA_TYPE.VIDEO, id);

    var displayname = getParticipantDisplayName(state, id);

    return {
        _audioTrack: audioTrack,
        _isEveryoneModerator: isEveryoneModerator(state),
        _largeVideo: largeVideo,
        _styles: ColorSchemeRegistry.get(state, 'Thumbnail'),
        _videoTrack: videoTrack,
        _reRedner: reRender,
        _hasTorch: hasTorch,
        _fromZoomParticipantId: state['features/large-video'].zoomParticipantId,
        _fromZoomParticipantLevel: state['features/large-video'].zoom,
        _toZoomParticipantId: state['features/large-video'].toZoomParticipantId,
        _toZoomParticipantLevel: state['features/large-video'].toZoomParticipantLevel
    };
}

export default connect(_mapStateToProps)(Thumbnail);
