import { request } from '../../helpers/request';

export const isInternalCall = payload => 
    payload.task.attributes.client_call === true

/*
  Called from beforeAcceptTask when the plugin attribute, client_call, is true.
  This creates a call from Twilio to the current agent for the reservation,
    which can be the dialing agent or the target agent.
  The call webhook returns TwiML to put the call into a conference.
  When called, task.attributes.from equals the contact_uri of the dialing agent.
 */
export const acceptInternalTask = ({ 
  reservation, payload 
}) => {
    const { REACT_APP_SERVICE_BASE_URL } = process.env;
    if (typeof(reservation.task.attributes.conference) !== 'undefined') {
        reservation.call(
          reservation.task.attributes.from,   // from (callerid)
          `${REACT_APP_SERVICE_BASE_URL}/internal-call/agent-join-conference?conferenceName=${reservation.task.attributes.conference.friendlyName}`,
          {accept: true}
        )
    } else { 
        reservation.call(
            reservation.task.attributes.from,
            `${REACT_APP_SERVICE_BASE_URL}/internal-call/agent-outbound-join?taskSid=${payload.task.taskSid}`, 
            {accept: true}
        )
    }
}

export const rejectInternalTask = async ({ 
  manager, payload 
}) => {
    
    await payload.task._reservation.accept();
    await payload.task.wrapUp();
    await payload.task.complete();
 
    const taskSid = payload.task.attributes.conferenceSid;
    
    request('internal-call/cleanup-rejected-task', manager, {
      taskSid
    }).then(response => {
      console.log('Outbound call has been placed into wrapping');
    })
    .catch(error => {
      console.log(error);
    });
}


export const toggleHoldInternalCall = ({ 
  task, manager, hold, resolve, reject
}) => {

  const conference = task.attributes.conference ? 
  task.attributes.conference.sid : task.attributes.conferenceSid;

  // JLAFER this looks like a possible null exception if the above check for
  // task.attributes.conference is really needed!
  const participant = task.attributes.conference.participants ?
    task.attributes.conference.participants.worker : task.attributes.worker_call_sid;

  return request('internal-call/hold-call', manager, {
    conference,
    participant,
    hold
  }).then(response => {
    resolve(response);
  })
  .catch(error => {
    console.log(error);
    reject(error);
  });
}