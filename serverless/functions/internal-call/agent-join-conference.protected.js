/*
  This is the TwiML callback for reservation.call if an internal call task is
  accepted and task.attributes.conference IS defined. This will be true for
  the task assigned to the called agent, because it's set by the event status
  callback that creates the task.
  It "dials" (moves the Twilio end of the call) into the conference named
  with the taskSid.
Event:
    conferenceName - the sid of the dialing task
*/
exports.handler = (context, event, callback) => {
	let twiml = new Twilio.twiml.VoiceResponse();
    twiml.dial().conference({
        endConferenceOnExit: true,
    }, event.conferenceName);
    callback(null, twiml);
};