// @flow

import React, { Component } from 'react';

import { View, Text } from 'react-native';
import { ColorSchemeRegistry } from '../../base/color-scheme';
import { ParticipantView,
        getParticipantById,
        getParticipantDisplayName } from '../../base/participants';
import { connect } from '../../base/redux';
import { DimensionsDetector } from '../../base/responsive-ui';
import { StyleType } from '../../base/styles';

import { translate } from '../../base/i18n';
import { Container } from '../../base/react';
import { Icon } from '../../base/font-icons';

import { AVATAR_SIZE } from './styles';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * The type of the React {@link Component} props of {@link LargeVideo}.
 */
type Props = {

    /**
     * The ID of the participant (to be) depicted by LargeVideo.
     *
     * @private
     */
    _participantId: string,

    _participantDisplayName: string,

    _fromZoomParticipantId: string,
    _fromZoomParticipantLevel: float,
    _toZoomParticipantId: string,
    _toZoomParticipantLevel: float,

    _videoCallToast: boolean,

    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * Callback to invoke when the {@code LargeVideo} is clicked/pressed.
     */
    onPress: Function,
};

/**
 * The type of the React {@link Component} state of {@link LargeVideo}.
 */
type State = {

    /**
     * Size for the Avatar. It will be dynamically adjusted based on the
     * available size.
     */
    avatarSize: number,

    /**
     * Whether the connectivity indicator will be shown or not. It will be true
     * by default, but it may be turned off if there is not enough space.
     */
    useConnectivityInfoLabel: boolean
};

const DEFAULT_STATE = {
    avatarSize: AVATAR_SIZE,
    useConnectivityInfoLabel: true
};

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on mobile/React Native.
 *
 * @extends Component
 */
class LargeVideo extends Component<Props, State> {
    state = {
        ...DEFAULT_STATE
    };

    /** Initializes a new {@code LargeVideo} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        // Bind event handlers so they are only bound once per instance.
        this._onDimensionsChanged = this._onDimensionsChanged.bind(this);
    }

    _onDimensionsChanged: (width: number, height: number) => void;

    /**
     * Handle this component's dimension changes. In case we deem it's too
     * small, the connectivity indicator won't be rendered and the avatar
     * will occupy the entirety of the available screen state.
     *
     * @param {number} width - The component's current width.
     * @param {number} height - The component's current height.
     * @private
     * @returns {void}
     */
    _onDimensionsChanged(width: number, height: number) {
        // Get the size, rounded to the nearest even number.
        const size = 2 * Math.round(Math.min(height, width) / 2);
        let nextState;

        if (size < AVATAR_SIZE * 1.5) {
            nextState = {
                avatarSize: size - 15, // Leave some margin.
                useConnectivityInfoLabel: false
            };
        } else {
            nextState = DEFAULT_STATE;
        }

        this.setState(nextState);
    }

    static setUserName(name) {
        LargeVideo.userName = name;
    }

    static getUserName() {
        return LargeVideo.userName;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            avatarSize,
            useConnectivityInfoLabel
        } = this.state;
        const {
            _participantId,
            _styles,
            onPress
        } = this.props;
        const { t } = this.props;

        const displayName = this.props._participantDisplayName;
        const fromZoomParticipantId = this.props._fromZoomParticipantId;
        const fromZoomParticipantLevel = this.props._fromZoomParticipantLevel;
        const toZoomParticipantId = this.props._toZoomParticipantId;
        const toZoomParticipantLevel = this.props._toZoomParticipantLevel;

        var zoomEnabled = false;

        // Only allow zooming on device.
        if (displayName && !displayName.includes('Admin')) {
            zoomEnabled = true;
        }

        var zoomUnlocked = true;

        // If someone else is zooming, disable zoom.
        // (But we still need to alow zooming in order to show the zoomed view)
        if (fromZoomParticipantLevel > 1) {
            zoomUnlocked = false;
        }

        // If device user is zooming some other view, disable zoom.
        if (toZoomParticipantId != _participantId && toZoomParticipantLevel > 1) {
            zoomUnlocked = false;
        }

        return (
            <DimensionsDetector
                onDimensionsChanged = { this._onDimensionsChanged }>
                <ParticipantView
                    avatarSize = { avatarSize }
                    onPress = { onPress }
                    participantId = { _participantId }
                    style = { _styles.largeVideo }
                    testHintId = 'org.jitsi.meet.LargeVideo'
                    useConnectivityInfoLabel = { useConnectivityInfoLabel }
                    zOrder = { 0 }
                    zoomEnabled = { zoomEnabled }
                    zoomUnlocked = { zoomUnlocked }
                    isLargeVideo = { true } />
                    { this.props._videoCallToast && <Container style = { _styles.zoomToastBackground }>
                    <Icon
                        name = 'Disabled-Zooming'
                        style = { _styles.zoomToastIcon } />
                    <Text style = { _styles.zoomToastTest }>
                        { t('atheer.zoomDisabled') }
                    </Text>
                </Container> }
            </DimensionsDetector>
        );
    }
}

/**
 * Maps (parts of) the Redux state to the associated LargeVideo's props.
 *
 * @param {Object} state - Redux state.
 * @private
 * @returns {{
 *     _participantId: string,
 *     _styles: StyleType
 * }}
 */
function _mapStateToProps(state) {
    var displayName = getParticipantDisplayName(state, state['features/large-video'].participantId);

    return {
        _participantId: state['features/large-video'].participantId,
        _styles: ColorSchemeRegistry.get(state, 'LargeVideo'),
        _participantDisplayName: displayName,
        _fromZoomParticipantId: state['features/large-video'].zoomParticipantId,
        _fromZoomParticipantLevel: state['features/large-video'].zoom,
        _toZoomParticipantId: state['features/large-video'].toZoomParticipantId,
        _toZoomParticipantLevel: state['features/large-video'].toZoomParticipantLevel,
        _videoCallToast: state['features/large-video'].videoCallToast
    };
}

export default translate(connect(_mapStateToProps)(LargeVideo));
