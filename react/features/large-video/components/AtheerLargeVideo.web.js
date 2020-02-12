// @flow

import React, { Component } from 'react';

import { Watermarks } from '../../base/react';
import { Captions } from '../../subtitles/';

import { commands, sendMessage } from '../../../../modules/API/external/external_api';

var imageQuality = 0.9;
var context;
var screenshotCanvas = document.getElementById('screenshot-canvas');
var w, h, ratio;
var annotationService;
var savedScale = 1.0;
var savedTranslationX = 0;
var savedTranslationY = 0;

declare var interfaceConfig: Object;

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
        let annotationStyle = {
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
                    <div id='annotationWrapper' className='w-full' style={annotationStyle} >
                        <canvas id='screenshot-canvas' className='w-full' style={styles}></canvas>
                        <div className="annotation"></div>
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
    receivedData = receivedData.params.data ? receivedData.params.data : receivedData;

    if(receivedData.name == commands.startAnnotation){
        onStartAnnotation();
    }

    function initScreenshotCanvas(video) {
        screenshotCanvas = document.getElementById('screenshot-canvas');
        context = screenshotCanvas.getContext('2d');
        ratio = video.videoWidth / video.videoHeight;
        w = 2 * video.videoWidth;
        h = parseInt(w / ratio, 10);
        screenshotCanvas.width = w;
        screenshotCanvas.height = h;
    }

    function onStartAnnotation() {
        var remoteVideo = document.getElementById('largeVideo');
        initScreenshotCanvas(remoteVideo);
        context.fillRect(0, 0, w, h);
        if (savedScale > 1) {
            context.setTransform(savedScale, 0, 0, savedScale, (0.5 - savedTranslationX * savedScale) * screenshotCanvas.width,
                (0.5 - savedTranslationY * savedScale) * screenshotCanvas.height);
        }
        context.drawImage(remoteVideo, 0, 0, w, h);
        var dataURI = screenshotCanvas.toDataURL('image/jpeg', imageQuality);
        console.log(dataURI);
        sendMessage(commands.startAnnotation,{'DataUri': dataURI});
    }
} 