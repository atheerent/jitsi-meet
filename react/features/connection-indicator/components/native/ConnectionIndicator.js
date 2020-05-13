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
            var bitrateUp = 0;
            var bitrateDown = 0;
            var bridgeCount = 0;
            var e2eRtt = 0;
            var framerate = '';
            var packetLossUp = 0;
            var packetLossDown = 0;
            var region = '';
            var resolution = '';
            var serverRegion = '';
            var localIP = '';
            var remoteIP = '';
            var transportType = '';
            if (stats.percent) {
                percent = stats.percent;
            }
            if (stats.bandwidth && stats.bandwidth.upload) {
                bandwidthUp = stats.bandwidth.upload;
            }
            if (stats.bandwidth && stats.bandwidth.download) {
                bandwidthDown = stats.bandwidth.download;
            }
            if (stats.bitrate && stats.bitrate.upload) {
                bitrateUp = stats.bitrate.upload;
            }
            if (stats.bitrate && stats.bitrate.download) {
                bitrateDown = stats.bitrate.download;
            }
            if (stats.bridgeCount) {
                bridgeCount = stats.bridgeCount;
            }
            if (stats.e2eRtt) {
                e2eRtt = stats.e2eRtt;
            }
            if (stats.framerate) {
                framerate = Object.keys(framerate || {})
                    .map(ssrc => framerate[ssrc])
                    .join(', ') || 'N/A';
            }
            if (stats.packetLoss && stats.packetLoss.upload) {
                packetLossUp = stats.packetLoss.upload;
            }
            if (stats.packetLoss && stats.packetLoss.download) {
                packetLossDown = stats.packetLoss.download;
            }
            if (stats.region) {
                region = stats.region;
            }
            if (stats.resolution) {
                resolution = Object.keys(resolution || {})
                    .map(ssrc => {
                        const { width, height } = resolution[ssrc];

                        return `${width}x${height}`;
                    })
                    .join(', ') || 'N/A';
            }
            if (stats.serverRegion) {
                serverRegion = stats.serverRegion;
            }
            if (stats.transport && stats.transport.length > 0) {
                localIP = stats.transport[0].localip;
                remoteIP = stats.transport[0].ip;
                transportType = stats.transport[0].type;
            }
            dispatch(updateConnectionStats(participantId, percent, bandwidthUp, bandwidthDown,
                bitrateUp, bitrateDown, bridgeCount, e2eRtt, framerate, packetLossUp, packetLossDown,
                region, resolution, serverRegion, localIP, remoteIP, transportType));
        }
    };
}

export default connect(undefined, _mapDispatchToProps)(ConnectionIndicator);
