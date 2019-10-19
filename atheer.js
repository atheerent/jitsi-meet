export const displayNamePrefix = 'Admin';
export const displayNameSplit = ':';
var splitIndex = 3;
var lastSelectedUserId;
var users = [];

export const iframeMessages = {
    annotation: 'annotation',
    annotationData: 'annotationData',
    clearAnnotation: 'clearAnnotation',
    receiveAnnotation: 'receiveAnnotation',
    receiveStartAnnotation: 'receiveStartAnnotation',
    receiveEndAnnotation: 'receiveEndAnnotation',
    stopAnnotation: 'stopAnnotation',
    startHosting: 'startHosting',
    stopHosting: 'stopHosting',
    cancelHosting: 'cancelHosting',
    pinUser: 'pinUser',
    setPreferredReceiverVideoQuality: 'setPreferredReceiverVideoQuality',
    startCall: 'startCall',
    endCall: 'endCall',
    toggleCamera: 'toggleAdminView',
    toggleMic: 'toggleMic',
    muteMic: 'muteMic',
    enableFlashlight: 'enableFlashlight',
    disableFlashlight: 'disableFlashlight',
    flashlightStatus: 'flashlightStatus',
    toggleFlashlight: 'toggleFlashlight',
    stateChange: 'stateChanged',
    annotationInProgress: 'annotationInProgress',
    userLeft: 'userLeft',
    userJoined: 'userJoined',
    initialized: 'initialized',
    onSelectionChange: 'onSelectionChange',
    changeColor: 'changeColor',
    undo: 'undo',
    redo: 'redo',
    text: 'text',
    setStrokeWidth: 'setStrokeWidth',
    arrow: 'arrow',
    zoom: 'zoom',
    zoomChange: 'zoomChange',
    userMuteChanged: 'userMuteChanged',
    applyZoom: 'applyZoom',
    setZoom: 'setZoom',
    startZooming: 'startZooming',
    endZooming: 'endZooming',
    saveAnnotation: 'saveAnnotation',
    saveAnnotationData: 'saveAnnotationData',
    disableP2pMode: 'disableP2pMode'
};

export function sendMessage(action, data) {
    window.parent.postMessage(JSON.stringify({
        action: action,
        data: data
    }), '*');
}

export function getUserHash(user) {
    var displayName = user.name ? user.name : user.getDisplayName();
    return getUserHashByName(displayName);
}

export function getUserHashByName(displayName) {
    var splitParts = displayName.split(displayNameSplit);
    return splitParts[1];
}

export function getDisplayName(displayName) {
    // splitPart[0]: device type / splitPart[1]: userhash / splitPart[2]: user full name
    // splitPart[3]: may exist if user name includes ":" so we add the for loop to handle this case
    if (displayName) {
        var splitParts = displayName.split(displayNameSplit);
        var name = splitParts[2];
        if (splitParts.length > splitIndex) {
            for (var i = 0; i < splitParts.length; i++) {
                if (i >= splitIndex) {
                    name += displayNameSplit + splitParts[i];
                }
            }
        }
        return name;
    }
}

export function getDeviceType(user) {
    var displayName = user.name ? user.name : user.getDisplayName();
    if (displayName.indexOf(displayNamePrefix) === 0) {
        return 'WEB';
    }
    return 'ANDROID';
}

var resolutionEnum = {
    HD: {
        width: 1280,
        text: 'atheer.videoThumbnail.videoResolution.hd'
    },
    SD: {
        width: 960,
        text: 'atheer.videoThumbnail.videoResolution.sd'
    },
    LD: {
        width: 640,
        text: 'atheer.videoThumbnail.videoResolution.ld'
    }
};

export function getResolutionString(width) {
    var values = Object.values(resolutionEnum);
    for (var i = 0; i < values.length; i++) {
        if (width >= values[i].width) {
            return values[i].text;
        }
    }
    return resolutionEnum.LD.text;
}

export function getUser(userHash, participants) {
    for (var i = 0; i < participants.length; i++) {
        var displayName = participants[i].name ? participants[i].name : participants[i].getDisplayName();
        if (displayName.includes(userHash)) {
            return participants[i];
        }
    }
}

export function getLastSelectedId() {
    return lastSelectedUserId;
}

export function setLastSelectedId(id) {
    lastSelectedUserId = id;
}

export function changeFlashlightStatus(id, status) {
    users[id] = {
        flashlightStatus: status
    };
}

export function enableFlashlight(id) {
    users[id] = {
        flashlightDisabled: false
    };
}

export function disableFlashlight(id) {
    users[id] = {
        flashlightDisabled: true
    };
}

export function removeUser(id) {
    users[id] = undefined;
}

export function getFlashStatus(id) {
    if (users[id] === undefined) {
        return false;
    }
    return users[id].flashlightStatus;
}

export function isFlashlightDisabled(id) {
    if (users[id] === undefined) {
        return false;
    }
    return users[id].flashlightDisabled;
}

export function getTranslatedText(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild.innerHTML;
}
