// @flow

import React from 'react';
import { Text } from 'react-native';

import { translate } from '../../../i18n';
import { connect } from '../../../redux';

import { _abstractMapStateToProps } from '../../functions';

import { type Props as AbstractProps } from './BaseDialog';
import BaseSubmitDialog from './BaseSubmitDialog';

import statsEmitter from '../../../../connection-indicator/statsEmitter';

import { ConnectionStatsTable } from '../../../../connection-stats';

type Props = AbstractProps & {
    participantId: string,
    contentKey: string | { key: string, params: Object},
};

type State = {
    ...AbstractState,

    stats: Object
};

/**
 * Implements an alert dialog, to simply show an error or a message, then disappear on dismiss.
 */
class ConnectionIndicatorDialog extends BaseSubmitDialog<Props, State> {
    /**
     * Instantiates a new {@code InputDialog}.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            stats: {}
        };

        this._onStatsUpdated = this._onStatsUpdated.bind(this);
    }

    /**
     * Starts listening for stat updates.
     *
     * @inheritdoc
     * returns {void}
     */
    componentDidMount() {
        statsEmitter.subscribeToClientStats(
            this.props.participantId, this._onStatsUpdated);
    }

    /**
     * Cleans up any queued processes, which includes listening for new stats
     * and clearing any timeout to hide the indicator.
     *
     * @private
     * @returns {void}
     */
    componentWillUnmount() {
        statsEmitter.unsubscribeToClientStats(
            this.props.participantId, this._onStatsUpdated);

    }

    /**
     * Callback invoked when new connection stats associated with the passed in
     * user ID are available. Will update the component's display of current
     * statistics.
     *
     * @param {Object} stats - Connection stats from the library.
     * @private
     * @returns {void}
     */
    _onStatsUpdated(stats = {}) {
        // Rely on React to batch setState actions.
        const { connectionQuality } = stats;
        const newPercentageState = typeof connectionQuality === 'undefined'
            ? {} : { percent: connectionQuality };
        const newStats = Object.assign(
            {},
            this.state.stats,
            stats,
            newPercentageState);

        this.setState({
            stats: newStats
        });
    }

    /**
     * Implements {@code BaseSubmitDialog._renderSubmittable}.
     *
     * @inheritdoc
     */
    _renderSubmittable() {
        const { _dialogStyles, contentKey, t } = this.props;
        const content
            = typeof contentKey === 'string'
                ? t(contentKey)
                : this._renderHTML(t(contentKey.key, contentKey.params));

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

        return (
            // <Text style = { _dialogStyles.text }>
            //     { JSON.stringify(this.state.stats) }
            // </Text>
            <ConnectionStatsTable
                bandwidth = { bandwidth }
                bitrate = { bitrate }
                bridgeCount = { bridgeCount }
                e2eRtt = { e2eRtt }
                framerate = { framerate }
                packetLoss = { packetLoss }
                region = { region }
                resolution = { resolution }
                serverRegion = { serverRegion }
                transport = { transport }>
            </ConnectionStatsTable>
        );
    }

    _renderHTML: string => Object | string
}

export default translate(connect(_abstractMapStateToProps)(ConnectionIndicatorDialog));
