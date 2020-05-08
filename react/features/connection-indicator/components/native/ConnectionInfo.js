// @flow

import React from 'react';

import { translate } from '../../../base/i18n';
import { CustomSubmitDialog, hideDialog } from '../../../base/dialog';
import { ConnectionStatsTable } from '../../../connection-stats';

import AbstractConnectionIndicator, {
    INDICATOR_DISPLAY_THRESHOLD,
    type Props as AbstractProps,
    type State as AbstractState
} from '../AbstractConnectionIndicator';

declare var interfaceConfig: Object;

/**
 * An array of display configurations for the connection indicator and its bars.
 * The ordering is done specifically for faster iteration to find a matching
 * configuration to the current connection strength percentage.
 *
 * @type {Object[]}
 */
const QUALITY_TO_WIDTH: Array<Object> = [

    // Full (3 bars)
    {
        colorClass: 'status-high',
        percent: INDICATOR_DISPLAY_THRESHOLD,
        tip: 'connectionindicator.quality.good',
        width: '100%'
    },

    // 2 bars
    {
        colorClass: 'status-med',
        percent: 10,
        tip: 'connectionindicator.quality.nonoptimal',
        width: '66%'
    },

    // 1 bar
    {
        colorClass: 'status-low',
        percent: 0,
        tip: 'connectionindicator.quality.poor',
        width: '33%'
    }

    // Note: we never show 0 bars as long as there is a connection.
];

/**
 * The type of the React {@code Component} props of {@link ConnectionInfo}.
 */
type Props = AbstractProps & {

    /**
     * The font-size for the icon.
     */
    iconSize: number,

    /**
     * Whether or not the displays stats are for local video.
     */
    isLocalVideo: boolean,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link ConnectionInfo}.
 */
type State = AbstractState & {

    /**
     * Whether or not the popover content should display additional statistics.
     */
    showMoreStats: boolean
};

/**
 * Implements a React {@link Component} which displays the current connection
 * quality percentage and has a popover to show more detailed connection stats.
 *
 * @extends {Component}
 */
class ConnectionInfo extends AbstractConnectionIndicator<Props, State> {
    /**
     * Initializes a new {@code ConnectionInfo} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);
        console.log("Sanjay->Render");
        this.state = {
            autoHideTimeout: undefined,
            showIndicator: false,
            showMoreStats: true,
            stats: {}
        };

        // Bind event handlers so they are only bound once for every instance.
        this._onToggleShowMore = this._onToggleShowMore.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {

        const visibilityClass = this._getVisibilityClass();
        const rootClassNames = `indicator-container ${visibilityClass}`;

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
        const colorClass = this._getConnectionColorClass();
        const indicatorContainerClassNames = `connection-indicator indicator ${colorClass}`;

        console.log("Sanjay->Render->bandwidth" + JSON.stringify(this.state.stats));

        return (
            <CustomSubmitDialog
                cancelKey = 'dialog.dismiss'
                onCancel = { this._onCancel }>
                      <ConnectionStatsTable
                          bandwidth = { bandwidth }
                          bitrate = { bitrate }
                          bridgeCount = { bridgeCount }
                          connectionSummary = { this._getConnectionStatusTip() }
                          e2eRtt = { e2eRtt }
                          framerate = { framerate }
                          isLocalVideo = { this.props.isLocalVideo }
                          onShowMore = { this._onToggleShowMore }
                          packetLoss = { packetLoss }
                          region = { region }
                          resolution = { resolution }
                          serverRegion = { serverRegion }
                          shouldShowMore = { this.state.showMoreStats }
                          transport = { transport }
                          connectionStatusClass = { colorClass } >
                      </ConnectionStatsTable>
            </CustomSubmitDialog>
        );
    }

    _onCancel() {
        this.props.dispatch(hideDialog());
    }

    /**
     * Returns a CSS class that interprets the current connection status as a
     * color.
     *
     * @private
     * @returns {string}
     */
    _getConnectionColorClass() {
        const { connectionStatus } = this.props;
        const { percent } = this.state.stats;
        return this._getDisplayConfiguration(percent).colorClass;
    }

    /**
     * Returns a string that describes the current connection status.
     *
     * @private
     * @returns {string}
     */
    _getConnectionStatusTip() {
        let tipKey;

        const { percent } = this.state.stats;

        if (typeof percent === 'undefined') {
            // If percentage is undefined then there are no stats available
            // yet, likely because only a local connection has been
            // established so far. Assume a strong connection to start.
            tipKey = 'connectionindicator.quality.good';
        } else {
            const config = this._getDisplayConfiguration(percent);

            tipKey = config.tip;
        }
        return this.props.t(tipKey);
    }

    /**
     * Get the icon configuration from QUALITY_TO_WIDTH which has a percentage
     * that matches or exceeds the passed in percentage. The implementation
     * assumes QUALITY_TO_WIDTH is already sorted by highest to lowest
     * percentage.
     *
     * @param {number} percent - The connection percentage, out of 100, to find
     * the closest matching configuration for.
     * @private
     * @returns {Object}
     */
    _getDisplayConfiguration(percent: number): Object {
        return QUALITY_TO_WIDTH.find(x => percent >= x.percent) || {};
    }

    /**
     * Returns additional class names to add to the root of the component. The
     * class names are intended to be used for hiding or showing the indicator.
     *
     * @private
     * @returns {string}
     */
    _getVisibilityClass() {
        return 'show-connection-indicator';
    }

    _onToggleShowMore: () => void;

    /**
     * Callback to invoke when the show more link in the popover content is
     * clicked. Sets the state which will determine if the popover should show
     * additional statistics about the connection.
     *
     * @returns {void}
     */
    _onToggleShowMore() {
        this.setState({ showMoreStats: !this.state.showMoreStats });
    }

    /**
     * Creates a ReactElement for displaying an icon that represents the current
     * connection quality.
     *
     * @returns {ReactElement}
     */
    _renderIcon() {
        const { percent } = this.state.stats;
        iconWidth = this._getDisplayConfiguration(percent).width;

        let emptyIconWrapperClassName = 'connection_empty';

        return [
            <span
                className = { emptyIconWrapperClassName }
                key = 'icon-empty'>
            </span>,
            <span
                className = 'connection_full'
                key = 'icon-full'
                style = {{ width: iconWidth }}>
            </span>
        ];
    }
}

export default translate(ConnectionInfo);
