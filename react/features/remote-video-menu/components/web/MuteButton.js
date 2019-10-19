/* @flow */

import React from 'react';
import PropTypes from 'prop-types';

import { translate } from '../../../base/i18n';
import { connect } from '../../../base/redux';

import AbstractMuteButton, {
    _mapStateToProps,
    type Props
} from '../AbstractMuteButton';

import RemoteVideoMenuButton from './RemoteVideoMenuButton';
import { muteRemoteParticipant } from '../../../base/participants/actions';
import { iframeMessages, sendMessage, getUserHashByName } from '../../../../../atheer';

/**
 * Implements a React {@link Component} which displays a button for audio muting
 * a participant in the conference.
 *
 * NOTE: At the time of writing this is a button that doesn't use the
 * {@code AbstractButton} base component, but is inherited from the same
 * super class ({@code AbstractMuteButton} that extends {@code AbstractButton})
 * for the sake of code sharing between web and mobile. Once web uses the
 * {@code AbstractButton} base component, this can be fully removed.
 */
class MuteButton extends AbstractMuteButton {
    /**
     * {@code MuteButton} component's property types.
     *
     * @static
    */
    static propTypes = {
        /**
         * Invoked to send a request for muting the participant with the passed
         * in participantID.
          */
        dispatch: PropTypes.func,

        /**
         * Whether or not the participant is currently audio muted.
         */
        isAudioMuted: PropTypes.bool,

        /**
         * Callback to invoke when {@code MuteButton} is clicked.
         */
        onClick: PropTypes.func,

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
     * Instantiates a new {@code Component}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this._handleClick = this._handleClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { _audioTrackMuted, participantID, t } = this.props;
        const muteConfig = _audioTrackMuted ? {
            translationKey: 'videothumbnail.muted',
            muteClassName: 'mutelink disabled'
        } : {
            translationKey: 'videothumbnail.domute',
            muteClassName: 'mutelink'
        };

        return (
            <RemoteVideoMenuButton
                buttonText = { t(muteConfig.translationKey) }
                displayClass = { muteConfig.muteClassName }
                iconClass = 'icon-mic-disabled'
                id = { `mutelink_${participantID}` }
                // eslint-disable-next-line react/jsx-handler-names
                onClick = { this._handleClick } />
        );
    }

    _handleClick = () => {
        const { dispatch, onClick, participantID, participantName } = this.props;

        sendMessage(iframeMessages.muteMic,{ 
            userHash: getUserHashByName(participantName)
        });
    }
}

export default translate(connect(_mapStateToProps)(MuteButton));
