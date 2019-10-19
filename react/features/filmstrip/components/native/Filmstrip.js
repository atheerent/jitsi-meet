// @flow

import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';

import { Icon } from '../../../base/font-icons';

import { Container, Platform } from '../../../base/react';
import { connect } from '../../../base/redux';
import {
    isNarrowAspectRatio,
    makeAspectRatioAware
} from '../../../base/responsive-ui';

import { isFilmstripVisible } from '../../functions';
import { getLocalParticipant } from '../../../base/participants';
import LocalThumbnail from './LocalThumbnail';
import styles from './styles';
import Thumbnail from './Thumbnail';

import { setFilmstripVisible } from '../../actions'

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * Filmstrip component's property types.
 */
type Props = {

    /**
     * The indicator which determines whether the filmstrip is enabled.
     *
     * @private
     */
    _enabled: boolean,

    /**
     * The participants in the conference.
     *
     * @private
     */
    _participants: Array<any>,

    _participantsNumber: int,

    /**
     * The indicator which determines whether the filmstrip is visible.
     *
     * @private
     */
    _visible: boolean,

    _forceHidden: boolean,

    _isGlass: boolean,

    _extendedToolsParticipant: int,

    _participantsFlashOn: Array<any>,

    _participantsFlashDisabled: Array<any>,

    /**
     * The local participant.
     */
    _localParticipant: Object
};

/**
 * Implements a React {@link Component} which represents the filmstrip on
 * mobile/React Native.
 *
 * @extends Component
 */
class Filmstrip extends Component<Props> {
    /**
     * Whether the local participant should be rendered separately from the
     * remote participants i.e. outside of their {@link ScrollView}.
     */
    _separateLocalThumbnail: boolean;

    /**
     * Constructor of the component.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        // XXX Our current design is to have the local participant separate from
        // the remote participants. Unfortunately, Android's Video
        // implementation cannot accommodate that because remote participants'
        // videos appear on top of the local participant's video at times.
        // That's because Android's Video utilizes EGL and EGL gives us only two
        // practical layers in which we can place our participants' videos:
        // layer #0 sits behind the window, creates a hole in the window, and
        // there we render the LargeVideo; layer #1 is known as media overlay in
        // EGL terms, renders on top of layer #0, and, consequently, is for the
        // Filmstrip. With the separate LocalThumnail, we should have left the
        // remote participants' Thumbnails in layer #1 and utilized layer #2 for
        // LocalThumbnail. Unfortunately, layer #2 is not practical (that's why
        // I said we had two practical layers only) because it renders on top of
        // everything which in our case means on top of participant-related
        // indicators such as moderator, audio and video muted, etc. For now we
        // do not have much of a choice but to continue rendering LocalThumbnail
        // as any other remote Thumbnail on Android.
        this._separateLocalThumbnail = false;
        this._onExpandFilmstrip = this._onExpandFilmstrip.bind(this);
        this._onHideFilmstrip = this._onHideFilmstrip.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        if (!this.props._enabled) {
            return null;
        }

        const isNarrowAspectRatio_ = isNarrowAspectRatio(this);
        const filmstripStyle
            = isNarrowAspectRatio_
                ? styles.filmstripNarrow
                : styles.filmstripWide;

        // TODO(Hao): Make this value dynamic and support all devices
        var filmStripLength = 100 * this.props._participantsNumber + 20;

        var hideFilmStripStyle = {
            right: filmStripLength
        }

        return (
            <Container
                style = { filmstripStyle } >
                {
                    this._separateLocalThumbnail
                        && !isNarrowAspectRatio_
                        && this.props._visible
                        && <Thumbnail participant = { this.props._localParticipant }  />
                }
                { !this.props._forceHidden && !this.props._visible && !this.props._isGlass && <Container
                    style = { [ styles.thumbnailToolBackgroundSmall, styles.thumbnailToolBackgroundDark ] }
                    onClick = { this._onExpandFilmstrip } >
                        <Icon name = 'navigate_before'
                        style = { [ styles.thumbnailToolIcon, styles.thumbnailToolIconPressed ] } />
                </Container>
                }
                { !this.props._forceHidden && this.props._visible && !this.props._isGlass && <Container
                    style = { [ styles.thumbnailToolBackgroundSmall, styles.thumbnailToolBackgroundDark, hideFilmStripStyle ] }
                    onClick = { this._onHideFilmstrip } >
                        <Icon name = 'navigate_next'
                        style = { [ styles.thumbnailToolIcon, styles.thumbnailToolIconPressed ] } />
                </Container>
                }
                { !this.props._forceHidden && this.props._visible && <ScrollView
                    horizontal = { true }
                    showsHorizontalScrollIndicator = { false }
                    showsVerticalScrollIndicator = { false }
                    style = { styles.scrollView } >
                    {
                        !this._separateLocalThumbnail
                            && !isNarrowAspectRatio_
                            && <Thumbnail participant = { this.props._localParticipant }  />
                    }
                    {
                        /* eslint-disable react/jsx-wrap-multilines */
                        this._sort(
                                this.props._participants,
                                isNarrowAspectRatio_)
                            .map(p =>
                                !this.props._isGlass && <Thumbnail
                                    key = { p.id }
                                    participant = { p }
                                    extendedToolsParticipant = { this.props._extendedToolsParticipant }
                                    participantsFlashOn = {this.props._participantsFlashOn }
                                    allowToolTips = { true } />)

                        /* eslint-enable react/jsx-wrap-multilines */
                    }
                    {
                        !this._separateLocalThumbnail
                            && isNarrowAspectRatio_
                            && <Thumbnail participant = { this.props._localParticipant }  />
                    }
                </ScrollView>
                }
                {
                    this._separateLocalThumbnail
                        && isNarrowAspectRatio_
                        && this.props._visible
                        && <Thumbnail participant = { this.props._localParticipant }  />
                }
            </Container>
        );
    }

    /**
     * Sorts a specific array of {@code Participant}s in display order.
     *
     * @param {Participant[]} participants - The array of {@code Participant}s
     * to sort in display order.
     * @param {boolean} isNarrowAspectRatio_ - Indicates if the aspect ratio is
     * wide or narrow.
     * @private
     * @returns {Participant[]} A new array containing the elements of the
     * specified {@code participants} array sorted in display order.
     */
    _sort(participants, isNarrowAspectRatio_) {
        // XXX Array.prototype.sort() is not appropriate because (1) it operates
        // in place and (2) it is not necessarily stable.

        const sortedParticipants = [
            ...participants
        ];

        if (isNarrowAspectRatio_) {
            // When the narrow aspect ratio is used, we want to have the remote
            // participants from right to left with the newest added/joined to
            // the leftmost side. The local participant is the leftmost item.
            sortedParticipants.reverse();
        }

        return sortedParticipants;
    }

    _onExpandFilmstrip() {
        const { dispatch } = this.props;

        dispatch(setFilmstripVisible(true));
    }

    _onHideFilmstrip() {
        const { dispatch } = this.props;

        dispatch(setFilmstripVisible(false));
    }
}

/**
 * Maps (parts of) the redux state to the associated {@code Filmstrip}'s props.
 *
 * @param {Object} state - The redux state.
 * @private
 * @returns {{
 *     _participants: Participant[],
 *     _visible: boolean
 * }}
 */
function _mapStateToProps(state) {
    const participants = state['features/base/participants'];
    const { enabled, visible, forceHidden, extendedToolsParticipant, participantsFlashOn,
            participantsFlashDisabled, reRender, isGlass } = state['features/filmstrip'];

    return {
        /**
         * The indicator which determines whether the filmstrip is enabled.
         *
         * @private
         * @type {boolean}
         */
        _enabled: enabled,

        /**
         * The remote participants in the conference.
         *
         * @private
         * @type {Participant[]}
         */
        _participants: participants.filter(p => !p.local),

        _participantsNumber: participants.length,

        /**
         * The indicator which determines whether the filmstrip is visible. The
         * mobile/react-native Filmstrip is visible when there are at least 2
         * participants in the conference (including the local one).
         *
         * @private
         * @type {boolean}
         */
        _visible: isFilmstripVisible(state),
        _forceHidden: forceHidden,
        _isGlass: isGlass,
        _extendedToolsParticipant: extendedToolsParticipant,
        _participantsFlashOn: participantsFlashOn,
        _participantsFlashDisabled: participantsFlashDisabled,
        _localParticipant: getLocalParticipant(state)
    };
}

export default connect(_mapStateToProps)(makeAspectRatioAware(Filmstrip));
