/*
  This is the callback for reservation.call if an internal call task is
  accepted and task.attributes.conference is NOT defined. This will be true for
  the "dialing" task assigned to the calling agent.
  It "dials" (moves the Twilio end of the call) into a new conference that will
  be named with the taskSid.
  Event:
    taskSid - the sid of the outbound dialing task routed to the dialing agent
*/
exports.handler = (context, event, callback) => {
    let twiml = new Twilio.twiml.VoiceResponse();
    twiml.dial().conference(
      {
        statusCallback: 'call-outbound-join',
        statusCallbackEvent: 'join end',
        endConferenceOnExit: true,
      },
      event.taskSid
    );
    callback(null, twiml);
};