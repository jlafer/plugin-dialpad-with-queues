import { Actions } from '@twilio/flex-ui';
import { acceptInternalTask, rejectInternalTask, isInternalCall, toggleHoldInternalCall } from './internalCall';
import { kickExternalTransferParticipant } from './externalTransfer';
import ConferenceService from '../helpers/ConferenceService';

export default (manager) => {
  Actions.addListener('beforeAcceptTask', (payload, abortFunction) => {
    // JLAFER use a custom Redux action to save the current task in state
    manager.store.dispatch({type: 'SET_TASK', payload: {task: payload.task}});

    const reservation = payload.task.sourceObject;
    if(isInternalCall(payload)){
      abortFunction();
      acceptInternalTask({ reservation, payload });
    } 
  })

  Actions.addListener('beforeRejectTask', (payload, abortFunction) => {
      if (isInternalCall(payload)) {
        abortFunction();
        rejectInternalTask({ manager, payload });
      } 
  })

  const holdCall = (payload, hold) => {
    return new Promise((resolve, reject) => {
      const task = payload.task;
      if (isInternalCall(payload)) {
        toggleHoldInternalCall({ 
          task, manager, hold, resolve, reject 
        });
      } else {
        resolve();
      }
    })
  }

  Actions.addListener('afterSelectTask', (payload) => {
    // JLAFER use a custom Redux action to save the current task in state
    manager.store.dispatch({type: 'SET_TASK', payload: {task: payload.task}});
  })

  Actions.addListener('beforeHoldCall', (payload) => {
    return holdCall(payload, true)
  })

  Actions.addListener('beforeUnholdCall', (payload) => {
    return holdCall(payload, false)
  })

  Actions.addListener('beforeHoldParticipant', (payload, abortFunction) => {
    const { participantType, targetSid: participantSid, task } = payload;
    if (participantType !== 'unknown') {
      return;
    }
    const { conferenceSid } = task.conference;
    abortFunction();
    console.log('Holding participant', participantSid);
    return ConferenceService.holdParticipant(conferenceSid, participantSid);
  });

  Actions.addListener('beforeUnholdParticipant', (payload, abortFunction) => {
    const { participantType, targetSid: participantSid, task } = payload;
    console.log('BEFOREUNOLDPARTICIPANT: conference:', task.conference);
    manager.store.dispatch({type: 'MY_UNHOLD_PARTICIPANT', payload: {task: payload.task}})
    if (participantType !== 'unknown') {
      return;
    }
    console.log('Holding participant', participantSid);
    const { conferenceSid } = task.conference;
    abortFunction();
    return ConferenceService.unholdParticipant(conferenceSid, participantSid);
  });

	Actions.addListener('beforeKickParticipant', (payload, abortFunction) => {
      const { participantType } = payload;
      if (
        participantType !== "transfer" &&
        participantType !== 'worker'
      ) {
        abortFunction();
        kickExternalTransferParticipant(payload);
      }
  })
}