import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * React {@code Component} for displaying an action in {@code RemoteVideoMenu}.
 *
 * @extends {Component}
 */
export default class RemoteVideoMenuButton extends Component {

    /**
     * {@code RemoteVideoMenuButton}'s property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * Text to display within the component that describes the onClick
         * action.
         */
        buttonText: PropTypes.string,

        /**
         * Additional CSS classes to add to the component.
         */
        displayClass: PropTypes.string,

        /**
         * The CSS classes for the icon that will display within the component.
         */
        iconClass: PropTypes.string,

        /**
         * The id attribute to be added to the component's DOM for retrieval
         * when querying the DOM. Not used directly by the component.
         */
        id: PropTypes.string,

        /**
         * Callback to invoke when the component is clicked.
         */
        onClick: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            buttonText,
            displayClass,
            iconClass,
            id,
            onClick
        } = this.props;

        const flashIcon = displayClass && displayClass === 'flash-off' ? 'images/flashlight_off.png' : 'images/flashlight_on.png';
        const linkClassName = `popupmenu__link ${displayClass || ''}`;
        const flashIconClass = iconClass === 'icon-flashlight';
        const itemTextClass = flashIconClass ? 'popupmenu__text p-b-sm' : 'popupmenu__text';

        return (
            <li className = 'popupmenu__item'>
                <a
                    className = { linkClassName }
                    id = { id }
                    onClick = { onClick }>
                    {flashIconClass ? this._renderFlashLightIcon(iconClass, flashIcon)
                        : <span className='popupmenu__icon'>
                            <i className={iconClass} />
                        </span>
                    }
                    <span className={itemTextClass}>
                        {buttonText}
                    </span>
                </a>
            </li>
        );
    }

    _renderFlashLightIcon(iconClass, flashIcon) {
        return (
            <img className={iconClass} src={flashIcon} />
        );
    }
}
