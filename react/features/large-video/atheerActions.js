// @flow

import type { Dispatch } from 'redux';

import {
    ANNOTATION_MODE
} from './atheerActionTypes';

const logger = require('jitsi-meet-logger').getLogger(__filename);

export function setAnnotationMode(annotationState: Boolean) {
    return {
        type: ANNOTATION_MODE,
        annotationState: annotationState
    };
}
