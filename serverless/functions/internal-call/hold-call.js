/*
  This function holds or unholds a conference participant.
  Event:
    conference - the SID of the conference
    participant - the participant identifier (call sid)
    hold - boolean, indicating whether to hold or unhold
*/
const TokenValidator = require('twilio-flex-token-validator').functionValidator;
let path = Runtime.getFunctions()['dialpad-utils'].path;
let assets = require(path);

exports.handler = TokenValidator( async (context, event, callback) => {
	const client = context.getTwilioClient();
  const { conference, participant, hold } = event;
  if (conference && participant && hold) {
    await client
      .conferences(conference)
      .participants(participant)
      .update({
        hold
      });
  }
  callback(null, assets.response("json", {}));
});