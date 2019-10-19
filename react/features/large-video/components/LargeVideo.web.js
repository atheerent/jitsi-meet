// @flow

import React, { Component } from 'react';

import { Watermarks } from '../../base/react';
import { Captions } from '../../subtitles/';

import {
    iframeMessages,
    sendMessage
} from '../../../../atheer';
import { annotationBuilder } from '../../../../annotation';

var imageQuality = 0.9;
var context;
var screenshotCanvas = document.getElementById('screenshot-canvas');
var w, h, ratio;
var annotationService;
var isReceivingZoom = false;
var previousTrack;
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
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        // TODO Use local library
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.7.22/fabric.min.js";
        s.async = true;
        document.head.appendChild(s);
    }

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
        let zoomStyle = {
            position: 'absolute',
            height: '160px',
            width: '240px',
            right: '20px',
            bottom: '60px',
            zIndex: '200',
            objectFit: 'fill'
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
                    <div id='zoomWrapper' className='w-full'>
                        <video
                            autoPlay={true}
                            id='previewVideo'
                            muted={true}
                            style={zoomStyle} />
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
    if (receivedData.action === iframeMessages.annotation) {
        onStartAnnotation();
    } else if (receivedData.action === iframeMessages.applyZoom && receivedData.data) {
        applyZoom(receivedData.data.x, receivedData.data.y, receivedData.data.z);
    } else if (receivedData.action === iframeMessages.startZooming) {
        onStartZooming();
    } else if (receivedData.action === iframeMessages.endZooming) {
        onEndZooming();
    } else if (receivedData.action === iframeMessages.receiveStartAnnotation) {
        setAnnotationImage(receivedData.data.imagePath, receivedData.data.disabled);
    } else if (receivedData.action === iframeMessages.receiveEndAnnotation) {
        stopAnnotation();
    } else if (receivedData.action === iframeMessages.stopAnnotation) {
        stopAnnotation();
    } else if (receivedData.action === iframeMessages.clearAnnotation && annotationService) {
        annotationService.clear();
    } else if (receivedData.action === iframeMessages.zoom && annotationService) {
        annotationService.onZoomClick(receivedData.data.zoom);
    } else if (receivedData.action === iframeMessages.annotationData && annotationService) {
        annotationService.draw(JSON.parse(receivedData.data));
    } else if (receivedData.action === iframeMessages.changeColor && annotationService) {
        annotationService.setColor(receivedData.data.color);
    } else if (receivedData.action === iframeMessages.undo && annotationService) {
        annotationService.onUndoClick();
    } else if (receivedData.action === iframeMessages.redo && annotationService) {
        annotationService.onRedoClick();
    } else if (receivedData.action === iframeMessages.text && annotationService) {
        annotationService.onAddTextClick();
    } else if (receivedData.action === iframeMessages.setStrokeWidth && annotationService) {
        annotationService.onSetStrokeClick(receivedData.data.width);
    } else if (receivedData.action === iframeMessages.arrow && annotationService) {
        annotationService.onAddArrowClick();
    } else if (receivedData.action === iframeMessages.zoomChange && annotationService) {
        annotationService.goToPoint(receivedData.data.position);
    } else if (receivedData.action === iframeMessages.saveAnnotation) {
        var dataURI = annotationService.onSaveAnnotationToAsset();
        sendMessage(iframeMessages.saveAnnotationData, {
            image: dataURI,
            close: receivedData.data.close
        });
    }
}

function applyZoom(x, y, z) {
    if (z === 1) {
        x = 0.5;
        y = 0.5;
    }
    var zoomView = document.getElementById('zoomWrapper');
    if (zoomView) {
        zoomView.style.display = (z === 1 || isReceivingZoom) ? "none" : "block";
    }

    var fullViewVideo = document.getElementById('largeVideoWrapper');
    var translationX = (0.5 - x) * fullViewVideo.offsetWidth * z;
    var translationY = (0.5 - y) * fullViewVideo.offsetHeight * z;

    savedScale = z;
    savedTranslationX = x;
    savedTranslationY = y;

    fullViewVideo.style.transform = "matrix(" + z + ", 0, 0, " + z + ", " + translationX + ", " + translationY + ")";
}

function onStartZooming() {
    isReceivingZoom = true;
}

function onEndZooming() {
    isReceivingZoom = false;
}

// TODO(Hao): Move preview track to a separate class.
export function setPreviewTrack(track) {
    var previewVideo = document.getElementById('previewVideo');
    if (previousTrack !== undefined) {
        previousTrack.detach(previewVideo)
    }
    track.attach(previewVideo);
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
    var fullViewVideo = document.getElementById('largeVideoWrapper');
    document.getElementById('zoomWrapper').style.display = "none";
    initScreenshotCanvas(remoteVideo);
    context.fillRect(0, 0, w, h);
    if (savedScale > 1) {
        context.setTransform(savedScale, 0, 0, savedScale, (0.5 - savedTranslationX * savedScale) * screenshotCanvas.width,
            (0.5 - savedTranslationY * savedScale) * screenshotCanvas.height);
    }
    context.drawImage(remoteVideo, 0, 0, w, h);
    var dataURI = screenshotCanvas.toDataURL('image/jpeg', imageQuality);
    sendMessage(iframeMessages.annotation, { 'Image': dataURI });
}

function setAnnotationImage(filePath, disabled) {
    $('.annotation').html('<canvas id="annotation-canvas" class="annotation-sketch"></canvas>');
    annotationService = annotationBuilder(disabled, filePath, function onMouseUp(oldData, newData) {
        sendMessage(iframeMessages.annotationData, {
            oldData: oldData,
            newData: newData
        });
    }, 'largeVideoWrapper');
}

function stopAnnotation() {
    $('.annotation').empty();
    annotationService = undefined;
    var zoomView = document.getElementById('zoomWrapper');
    zoomView.style.display = (savedScale === 1 || isReceivingZoom) ? "none" : "block";
}
