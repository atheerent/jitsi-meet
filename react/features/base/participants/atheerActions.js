import { set } from '../redux';

import {
    SHOW_PARTICIPANT_TOOLS,
    HIDE_PARTICIPANT_TOOLS
} from './atheerActionTypes';

export function showParticipantTools(id) {
     return {
         type: SHOW_PARTICIPANT_TOOLS,
         participant: {
             id
         }
     };
 }

  export function hideParticipantTools(id) {
     return {
         type: HIDE_PARTICIPANT_TOOLS,
         participant: {
             id
         }
     };
 }
