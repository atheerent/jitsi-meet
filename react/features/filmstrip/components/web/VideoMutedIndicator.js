/* @flow */

import React, { Component } from 'react';

import { BaseIndicator } from '../../../base/react';

/**
 * The type of the React {@code Component} props of {@link VideoMutedIndicator}.
 */
type Props = {

    /**
     * From which side of the indicator the tooltip should appear from.
     */
    tooltipPosition: string
};

/**
 * React {@code Component} for showing a video muted icon with a tooltip.
 *
 * @extends Component
 */
class VideoMutedIndicator extends Component<Props> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <BaseIndicator
                className = 'videoMuted toolbar-icon'
                iconClassName = 'icon-camera-disabled'
                tooltipPosition = { this.props.tooltipPosition } />
        );
    }
}

export default VideoMutedIndicator;
