// @flow

import React from 'react';
import type { Dispatch } from 'redux';

import { IconSignalLevel0, IconSignalLevel1, IconSignalLevel2 } from '../../../base/icons';
import { BaseIndicator } from '../../../base/react';
import { connect } from '../../../base/redux';

import AbstractConnectionIndicator, {
    type Props as AbstractProps,
    type State
} from '../AbstractConnectionIndicator';

import { updateConnectionStats } from '../../../filmstrip/atheerActions';

import { CONNECTOR_INDICATOR_COLORS } from './styles';

const logger = require('jitsi-meet-logger').getLogger(__filename);

const ICONS = [
    IconSignalLevel0,
    IconSignalLevel1,
    IconSignalLevel2
];

type Props = AbstractProps & {

    dispatch: Dispatch<any>,
    _broadcastStats: Function

};

/**
 * Implements an indicator to show the quality of the connection of a participant.
 */
class ConnectionIndicator extends AbstractConnectionIndicator<Props, State> {
    /**
     * Initializes a new {@code ConnectionIndicator} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            autoHideTimeout: undefined,
            showIndicator: false,
            stats: {}
        };

        this.props = props;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { showIndicator, stats } = this.state;
        const { percent } = stats;
        const { _broadcastStats, participantId } = this.props;

        this.props._broadcastStats(participantId, stats);

        if (!showIndicator || typeof percent === 'undefined') {
            return null;
        }

        // Signal level on a scale 0..2
        const signalLevel = Math.floor(percent / 33.4);

        return (
            <BaseIndicator
                icon = { ICONS[signalLevel] }
                iconStyle = {{
                    color: CONNECTOR_INDICATOR_COLORS[signalLevel]
                }} />
        );
    }

}

function _mapDispatchToProps(dispatch: Function, ownProps): Object {
    logger.log('deeep _mapDispatchToProps called');
    return {
        _broadcastStats(participantId, stats) {
            var percent = 0;
            var bandwidthUp = 0;
            var bandwidthDown = 0;
            if (stats.percent) {
                percent = stats.percent;
            }
            if (stats.bandwidth && stats.bandwidth.upload) {
                bandwidthUp = stats.bandwidth.upload;
            }
            if (stats.bandwidth && stats.bandwidth.download) {
                bandwidthDown = stats.bandwidth.download;
            }
            dispatch(updateConnectionStats(participantId, percent, bandwidthUp, bandwidthDown));
        }
    };
}

export default connect(undefined, _mapDispatchToProps)(ConnectionIndicator);
