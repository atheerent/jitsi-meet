// @flow

import _ from 'lodash';
import React from 'react';

import VideoLayout from '../../../../../modules/UI/videolayout/VideoLayout';
import { setAudioOnly, setPreferredReceiverVideoQuality } from '../../../base/conference';

import { obtainConfig } from '../../../base/config';
import { connect, disconnect } from '../../../base/connection';
import { translate } from '../../../base/i18n';
import { connect as reactReduxConnect } from '../../../base/redux';
import { Chat } from '../../../chat';
import { Filmstrip } from '../../../filmstrip';
import { CalleeInfoContainer } from '../../../invite';
import { LargeVideo } from '../../../large-video';
import { LAYOUTS, getCurrentLayout } from '../../../video-layout';

import {
    Toolbox,
    fullScreenChanged,
    setToolboxAlwaysVisible,
    showToolbox
} from '../../../toolbox';

import { maybeShowSuboptimalExperienceNotification } from '../../functions';

import { MEDIA_TYPE, VIDEO_MUTISM_AUTHORITY, setVideoMuted } from '../../../base/media';
import { iframeMessages, sendMessage, displayNamePrefix, displayNameSplit, getLastSelectedId, getUser } from '../../../../../atheer';
import { appNavigate } from '../../../app';
import { isLocalTrackMuted } from '../../../base/tracks';
import { updateSettings } from '../../../base/settings/actions';
import { setAudioMuted } from '../../../base/media/actions';
import { getLocalParticipant, getPinnedParticipant, pinParticipant } from '../../../base/participants';

import Labels from './Labels';
import { default as Notice } from './Notice';
import { default as Subject } from './Subject';
import {
    AbstractConference,
    abstractMapStateToProps
} from '../AbstractConference';

import type { AbstractProps } from '../AbstractConference';
import { toggleScreensharing } from '../../../base/tracks';

declare var APP: Object;
declare var config: Object;
declare var interfaceConfig: Object;

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * DOM events for when full screen mode has changed. Different browsers need
 * different vendor prefixes.
 *
 * @private
 * @type {Array<string>}
 */
const FULL_SCREEN_EVENTS = [
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'fullscreenchange'
];

/**
 * The CSS class to apply to the root element of the conference so CSS can
 * modify the app layout.
 *
 * @private
 * @type {Object}
 */
const LAYOUT_CLASSNAMES = {
    [LAYOUTS.HORIZONTAL_FILMSTRIP_VIEW]: 'horizontal-filmstrip',
    [LAYOUTS.TILE_VIEW]: 'tile-view',
    [LAYOUTS.VERTICAL_FILMSTRIP_VIEW]: 'vertical-filmstrip'
};

var audioOnly = false;

/**
 * The type of the React {@code Component} props of {@link Conference}.
 */
type Props = AbstractProps & {

    /**
     * Whether the local participant is recording the conference.
     */
    _iAmRecorder: boolean,

    /**
     * The CSS class to apply to the root of {@link Conference} to modify the
     * application layout.
     */
    _layoutClassName: string,

    /** 
    * Whether video is currently muted or not.
    */
    _videoMuted: boolean;

    _audioMuted: boolean;

    _conference: Object;
    _localUser: Object;

    dispatch: Function,
    t: Function
}

/**
 * The conference page of the Web application.
 */
class Conference extends AbstractConference<Props, *> {
    _onFullScreenChange: Function;
    _onShowToolbar: Function;
    _originalOnShowToolbar: Function;

    /**
     * Initializes a new Conference instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);
        this.onMessage = this.onMessage.bind(this);
        sendMessage(iframeMessages.initialized);

        // Throttle and bind this component's mousemove handler to prevent it
        // from firing too often.
        this._originalOnShowToolbar = this._onShowToolbar;
        this._onShowToolbar = _.throttle(
            () => this._originalOnShowToolbar(),
            100,
            {
                leading: true,
                trailing: false
            });

        // Bind event handler so it is only bound once for every instance.
        this._onFullScreenChange = this._onFullScreenChange.bind(this);
    }

    /**
     * Start the connection and get the UI ready for the conference.
     *
     * @inheritdoc
     */
    componentDidMount() {
        const { configLocation } = config;
        window.onmessage = this.onMessage;

        if (configLocation) {
            obtainConfig(configLocation, this.props._room)
                .then(() => {
                    const now = window.performance.now();

                    APP.connectionTimes['configuration.fetched'] = now;
                    logger.log('(TIME) configuration fetched:\t', now);

                    this._start();
                })
                .catch(err => {
                    logger.log(err);

                    // Show obtain config error.
                    APP.UI.messageHandler.showError({
                        descriptionKey: 'dialog.connectError',
                        titleKey: 'connection.CONNFAIL'
                    });
                });
        } else {
            this._start();
        }
    }
    /**
      * Indicates if video is currently muted ot nor.
      * @override
      * @protected
      * @returns {boolean}
      */

    _isVideoMuted() {
        return this.props._videoMuted;
    }

    _isAudioMuted() {
        return this.props._audioMuted;
    }

    onMessage(event) {
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
        if (receivedData.action === iframeMessages.toggleCamera) {
            this.props.dispatch(setVideoMuted(!this._isVideoMuted(), VIDEO_MUTISM_AUTHORITY.USER, /* ensureTrack */ true));
        } else if (receivedData.action === iframeMessages.toggleMic) {
            this.props.dispatch(setAudioMuted(!this._isAudioMuted(), /* ensureTrack */ true));
        } else if (receivedData.action === iframeMessages.startCall) {
            var currentUser = receivedData.data.currentUser;
            var lastName = currentUser.lastName && currentUser.lastName !== 'null' ? ' ' + currentUser.lastName : '';
            this.props.dispatch(updateSettings({
                avatarURL: currentUser.image,
                displayName: displayNamePrefix + displayNameSplit + currentUser.userHash + displayNameSplit + currentUser.name + lastName
            }));
        } else if (receivedData.action === iframeMessages.endCall) {
            if (navigator.product === 'ReactNative') {
                this.props.dispatch(appNavigate(undefined));
            } else {
                this.props.dispatch(disconnect(true));
            }
        } else if (receivedData.action === iframeMessages.setPreferredReceiverVideoQuality) {
            if (receivedData.data === 0) {
                audioOnly = true;
                this.props.dispatch(setAudioOnly(true));
            } else {
                this.props.dispatch(setPreferredReceiverVideoQuality(receivedData.data));
                if (audioOnly) {
                    audioOnly = false;
                    this.props.dispatch(setAudioOnly(false));
                }
            }
        } else if (receivedData.action === iframeMessages.startHosting) {
            var userHash = receivedData.data.user.userHash;
            var localName = this.props._localUser.name ? this.props._localUser.name : this.props._localUser.getDisplayName();
            var user = localName.includes(userHash) ? this.props._localUser :
                getUser(userHash, this.props._conference.conference.getParticipants());
            var id = user.id ? user.id : user.getId();
            this.pinUser(id);
            if (localName.includes(userHash)) {
                this.props.dispatch(toggleScreensharing());
            }
        } else if (receivedData.action === iframeMessages.stopHosting) {
            var userHash = receivedData.data.user.userHash;
            var localName = this.props._localUser.name ? this.props._localUser.name : this.props._localUser.getDisplayName();
            this.pinUser(getLastSelectedId());
            if (localName.includes(userHash)) {
                this.props.dispatch(toggleScreensharing());
            }
        } else if (receivedData.action === iframeMessages.cancelHosting) {
            this.pinUser(getLastSelectedId());
        }
    }

    pinUser(id) {
        this.props._conference.conference.selectParticipant(id);
        const pinnedParticipant
            = getPinnedParticipant(APP.store.getState()) || {};
        const participantIdToPin
            = pinnedParticipant && pinnedParticipant.id === id
                ? null : id;

        APP.store.dispatch(pinParticipant(participantIdToPin));
    }

    /**
     * Calls into legacy UI to update the application layout, if necessary.
     *
     * @inheritdoc
     * returns {void}
     */
    componentDidUpdate(prevProps) {
        if (this.props._shouldDisplayTileView
            === prevProps._shouldDisplayTileView) {
            return;
        }

        // TODO: For now VideoLayout is being called as LargeVideo and Filmstrip
        // sizing logic is still handled outside of React. Once all components
        // are in react they should calculate size on their own as much as
        // possible and pass down sizings.
        VideoLayout.refreshLayout();
    }

    /**
     * Disconnect from the conference when component will be
     * unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        APP.UI.unbindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.removeEventListener(name, this._onFullScreenChange));

        APP.conference.isJoined() && this.props.dispatch(disconnect());
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            VIDEO_QUALITY_LABEL_DISABLED,

            // XXX The character casing of the name filmStripOnly utilized by
            // interfaceConfig is obsolete but legacy support is required.
            filmStripOnly: filmstripOnly
        } = interfaceConfig;
        const hideVideoQualityLabel
            = filmstripOnly
            || VIDEO_QUALITY_LABEL_DISABLED
            || this.props._iAmRecorder;

        return (
            <div
                className={this.props._layoutClassName}
                id='videoconference_page'
                onMouseMove={this._onShowToolbar}>
                <Notice />
                <Subject />
                <div id='videospace'>
                    <LargeVideo />
                    {hideVideoQualityLabel
                        || <Labels />}
                    <Filmstrip filmstripOnly={filmstripOnly} />
                </div>

                {filmstripOnly || <Toolbox />}
                {filmstripOnly || <Chat />}

                {this.renderNotificationsContainer()}

                <CalleeInfoContainer />
            </div>
        );
    }

    /**
     * Updates the Redux state when full screen mode has been enabled or
     * disabled.
     *
     * @private
     * @returns {void}
     */
    _onFullScreenChange() {
        this.props.dispatch(fullScreenChanged(APP.UI.isFullScreen()));
    }

    /**
     * Displays the toolbar.
     *
     * @private
     * @returns {void}
     */
    _onShowToolbar() {
        this.props.dispatch(showToolbox());
    }

    /**
     * Until we don't rewrite UI using react components
     * we use UI.start from old app. Also method translates
     * component right after it has been mounted.
     *
     * @inheritdoc
     */
    _start() {
        APP.UI.start();

        APP.UI.registerListeners();
        APP.UI.bindEvents();

        FULL_SCREEN_EVENTS.forEach(name =>
            document.addEventListener(name, this._onFullScreenChange));

        const { dispatch, t } = this.props;

        dispatch(connect());

        maybeShowSuboptimalExperienceNotification(dispatch, t);

        interfaceConfig.filmStripOnly
            && dispatch(setToolboxAlwaysVisible(true));
    }
}

/**
 * Maps (parts of) the Redux state to the associated props for the
 * {@code Conference} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state) {
    const currentLayout = getCurrentLayout(state);

    return {
        ...abstractMapStateToProps(state),
        _iAmRecorder: state['features/base/config'].iAmRecorder,
        _layoutClassName: LAYOUT_CLASSNAMES[currentLayout],
        _videoMuted: isLocalTrackMuted(state['features/base/tracks'], MEDIA_TYPE.VIDEO),
        _audioMuted: isLocalTrackMuted(state['features/base/tracks'], MEDIA_TYPE.AUDIO),
        _conference: state['features/base/conference'],
        _localUser: getLocalParticipant(state)
    };
}

export default reactReduxConnect(_mapStateToProps)(translate(Conference));
