// @flow

import React from 'react';

import { BaseIndicator } from '../../../base/react';
import { connect } from '../../../base/redux';

import AbstractConnectionIndicator, {
    type Props,
    type State
} from '../AbstractConnectionIndicator';

import { CONNECTOR_INDICATOR_COLORS } from './styles';

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

        logger.warn('here');

        this.state = {
            autoHideTimeout: undefined,
            showIndicator: false,
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
        const { showIndicator, stats } = this.state;
        const { percent } = stats;

        if (typeof percent === 'undefined') {
            return null;
        }

        var band = "no result";
        var upload = "no bitrate speed";
        if (stats.bitrate != 'undefined') {
            bitrate = "some result";
            if (stats.bitrate.upload != 'undefined') {
                upload = 'bitrate up: ' + stats.bitrate.upload + 'kbps';
            }
        }

        // Signal level on a scale 0..2
        const signalLevel = 'signal level: ' + Math.floor(percent / 33.4);

        return (
            <Container>
                <Text>{signalLevel}</Text>
                <Text>{upload}</Text>
            </Container>
        );
    }

}

export default connect()(ConnectionIndicator);
