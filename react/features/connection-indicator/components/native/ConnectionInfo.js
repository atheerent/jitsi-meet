import React from 'react';

import { translate } from '../../../base/i18n';
import { CustomSubmitDialog, hideDialog } from '../../../base/dialog';
import { ConnectionStatsTable } from '../../../connection-stats/components/ConnectionStatsTable';

import AbstractConnectionIndicator, {
    INDICATOR_DISPLAY_THRESHOLD,
    type Props as AbstractProps,
    type State as AbstractState
} from '../AbstractConnectionIndicator';

/**
 * The type of the React {@code Component} props of {@link ConnectionInfo}.
 */
type Props = AbstractProps & {

    participantId: string,

    isLocalVideo: boolean

}

/**
 * Implements a React {@link Component} which displays the current connection
 * quality percentage and has a popover to show more detailed connection stats.
 *
 * @extends {Component}
 */
class ConnectionInfo extends AbstractConnectionIndicator<Props, State> {
    /**
     * Initializes a new {@code ConnectionIndicator} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            stats: {}
        };

        this._onCancel = this._onCancel.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            bandwidth,
            bitrate,
            bridgeCount,
            e2eRtt,
            framerate,
            packetLoss,
            region,
            resolution,
            serverRegion,
            transport
        } = this.state.stats;

        const isLocalVideo = this.props.isLocalVideo;

        return (
            <CustomSubmitDialog
                cancelKey = 'dialog.dismiss'
                onCancel = { this._onCancel }>
                    <ConnectionStatsTable
                        bandwidth = { bandwidth }
                        bitrate = { bitrate }
                        bridgeCount = { bridgeCount }
                        e2eRtt = { e2eRtt }
                        framerate = { framerate }
                        isLocalVideo = { isLocalVideo }
                        packetLoss = { packetLoss }
                        region = { region }
                        resolution = { resolution }
                        serverRegion = { serverRegion }
                        transport = { transport }>
                    </ConnectionStatsTable>
            </CustomSubmitDialog>

        );
    }

    _onCancel() {
        this.props.dispatch(hideDialog());
    }
}

export default translate(ConnectionInfo);