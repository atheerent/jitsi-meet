import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { translate } from '../../../base/i18n';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';
import {
    getUserHashByName,
    iframeMessages,
    sendMessage,
    getFlashStatus,
    changeFlashlightStatus
} from '../../../../../atheer.js';

var isFlashLightOn;

class FlashlightButton extends Component {
    /**
     * @static
     */
    static propTypes = {
        /**
         * Invoked to signal the participant with the passed in participantID
         * should be removed from the conference.
         */
        dispatch: PropTypes.func,

        /**
         * Callback to invoke when {@code FlashlightButton} is clicked.
         */
        onClick: PropTypes.func,

        isEnabled: PropTypes.bool,

        isFlashOn: PropTypes.bool,

        /**
         * The ID of the participant linked to the onClick callback.
         */
        participantID: PropTypes.string,

        participantName: PropTypes.string,

        /**
         * Invoked to obtain translated strings.
         */
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code FlashlightButton} instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { participantID, isFlashOn, isEnabled, t } = this.props;
        const flashStatus = getFlashStatus(participantID);
        isFlashLightOn = typeof flashStatus === 'undefined' ? isFlashOn : flashStatus;
        var flashConfig = isFlashLightOn ? {
            translationKey: 'atheer.videoThumbnail.flashOff',
            flashClassName: 'flash-off'
        } : {
            translationKey: 'atheer.videoThumbnail.flashOn',
            flashClassName: ''
        };

        if (!isEnabled) {
            flashConfig = {
                translationKey: 'atheer.videoThumbnail.flashOff',
                flashClassName: 'flash-off disabled'
            }
        }

        return (
            <RemoteVideoMenuButton
                buttonText = { t(flashConfig.translationKey) }
                displayClass = { flashConfig.flashClassName }
                iconClass = 'icon-flashlight'
                id = { `flashlightlink_${participantID}` }
                onClick = { this._onClick } />
        );
    }

    /**
     * Remove the participant with associated participantID from the conference.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        const { onClick, participantID, participantName } = this.props;
        isFlashLightOn = !isFlashLightOn;
        changeFlashlightStatus(participantID, isFlashLightOn);
        sendMessage(iframeMessages.toggleFlashlight, {
            userHash: getUserHashByName(participantName)
        });
        this.forceUpdate();
        if (onClick) {
            onClick();
        }
    }
}

export default translate(connect()(FlashlightButton));
