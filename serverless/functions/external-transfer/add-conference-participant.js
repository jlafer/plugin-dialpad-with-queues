/*
  This function dials an external party and adds them to an existing conference,
  named by the taskSid parameter.
  It uses conference.participants.create(to, from, ...) to make the call.

  It also sets a status callback to receive call-progress events for the call
  being used to add the new party. The callback function updates a Sync map that
  is monitored by the client to get those events.

  Event:
    conferenceSid - the SID of the conference for the dialing agent
    JLAFER - renamed taskSid to conferenceSid, reflecting what is being passed
    to - the number to be dialed
      NOTE: can also be a SIP endpoint or client id; parameters can be appended
    from - the callerid to show the external party
*/
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator(async (context, event, callback) => {
  const {
    conferenceSid,
    to,
    from
  } = event;
  console.log(`add-conference-participant: adding ${to} to conference ${conferenceSid}`);
  try {
    const client = context.getTwilioClient();
    const participantsResponse = await client
      .conferences(conferenceSid)
      .participants
      .create({
        to,
        from,
        earlyMedia: true,
        endConferenceOnExit: false,
        statusCallback: `https://${context.DOMAIN_NAME}/external-transfer/conference-call-status-callback`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });
    /* console.log('Participant response properties:');
      Object.keys(participantsResponse).forEach(key => {
        console.log(`${key}: ${participantsResponse[key]}`);
      });
    */
    callback(null, assets.response("json", participantsResponse));
  }
  catch (err) {
    console.log(`add-conference-participant: caught ERROR = ${err}`);
    callback(err, assets.response());
  }
});