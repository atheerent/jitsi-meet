// @flow

import React, { Component } from 'react';

import { Watermarks } from '../../base/react';
import { Captions } from '../../subtitles/';

import { commands } from '../../../../modules/API/external/external_api';

var imageQuality = 0.9;
var context, screenshotCanvas;

declare var interfaceConfig: Object;
declare var APP: Object;

/**
 * Implements a React {@link Component} which represents the large video (a.k.a.
 * the conference participant who is on the local stage) on Web/React.
 *
 * @extends Component
 */
export default class LargeVideo extends Component<{}> {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {React$Element}
     */
    render() {
        let styles = {
            display: 'none'
        };
        let screenshotStyle = {
            position: 'absolute',
            left: '0px',
            top: '-50px',
            width: '100%',
            height: '100%'
        };

        return (
            <div
                className = 'videocontainer'
                id = 'largeVideoContainer'>
                <div id = 'sharedVideo'>
                    <div id = 'sharedVideoIFrame' />
                </div>
                <div id = 'etherpad' />

                <Watermarks />

                <div id = 'dominantSpeaker'>
                    <div className = 'dynamic-shadow' />
                    <div id = 'dominantSpeakerAvatarContainer' />
                </div>
                <div id = 'remotePresenceMessage' />
                <span id = 'remoteConnectionMessage' />
                <div id = 'largeVideoElementsContainer'>
                    <div id = 'largeVideoBackgroundContainer' />

                    {/*
                      * FIXME: the architecture of elements related to the large
                      * video and the naming. The background is not part of
                      * largeVideoWrapper because we are controlling the size of
                      * the video through largeVideoWrapper. That's why we need
                      * another container for the background and the
                      * largeVideoWrapper in order to hide/show them.
                      */}
                    <div id = 'largeVideoWrapper'>
                        <video
                            autoPlay = { true }
                            id = 'largeVideo'
                            muted = { true } />
                    </div>
                    <div id='screenshotWrapper' className='w-full' style={screenshotStyle} >
                        <canvas id='screenshot-canvas' className='w-full' style={styles}></canvas>
                    </div>
                </div>
                { interfaceConfig.DISABLE_TRANSCRIPTION_SUBTITLES
                    || <Captions /> }
                <span id = 'localConnectionMessage' />
            </div>
        );
    }
}

window.addEventListener("message", onMessage, false);

function onMessage(event) {
    var receivedData;
    if (!event.data) {
        console.error('Message event contains no readable data.');
        return;
    }
    if (typeof event.data === 'object') {
        receivedData = event.data;
    } else {
        try {
            receivedData = JSON.parse(event.data);
        } catch (e) {
            receivedData = {};
            return;
        }
    }
    receivedData = receivedData.params && receivedData.params.data ? receivedData.params.data : receivedData;

    if(receivedData.name == commands.captureScreenShot){
        onCaptureScreenshot();
    }

    function onCaptureScreenshot() {
        var remoteVideo = document.getElementById('largeVideo');
        screenshotCanvas = document.getElementById('screenshot-canvas');
        context = screenshotCanvas.getContext('2d');
        screenshotCanvas.width = remoteVideo.videoWidth;
        screenshotCanvas.height = remoteVideo.videoHeight;
        context.fillRect(0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);
        context.drawImage(remoteVideo, 0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);
        var image = {
            width: remoteVideo.videoWidth,
            height: remoteVideo.videoHeight,
            dataURI: screenshotCanvas.toDataURL('image/jpeg', imageQuality)
        };
        APP.API.notifyScreenShotReady(image);
    }
} 