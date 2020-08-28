import React, { Component } from 'react';

import { Dialog } from '../../../dialog';
import { hideDialog } from '../../actions';
import { translate } from '../../../i18n';

declare var APP: Object;

/**
 * Implements a React {@link Component} which displays the component
 * {@code ScreenShare Warning} in a dialog.
 *
 * @extends Component
 */
class ScreenShareDialog extends Component {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        let description = "Screen sharing will share your information."
        return (
            <Dialog
                hideCancelButton = { true }
                okKey = 'dialog.Ok'
                onSubmit = { this._onSubmit }
                titleKey = 'dialog.shareYourScreen'
                width = 'small'>
                    {description}
            </Dialog>
        );
    }

    _onSubmit = () => {
        APP.store.dispatch(hideDialog());

        // eslint-disable-next-line no-empty-function
        APP.conference.toggleScreenSharing().catch(() => {});
    }
}

export default translate(ScreenShareDialog);
