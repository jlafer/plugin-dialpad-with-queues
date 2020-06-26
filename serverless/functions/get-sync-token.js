exports.handler = function(context, event, callback) {
  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader("Access-Control-Allow-Headers", "Authorization,Content-Type,Accept");
  response.appendHeader("Content-Type", "application/json");

  try {
    const ACCOUNT_SID = context.ACCOUNT_SID;
    const TWILIO_SYNC_SERVICE = process.env.TWILIO_SYNC_SERVICE;
    if (! TWILIO_SYNC_SERVICE)
      callback('TWILIO_SYNC_SERVICE env variable not set', response);
    const API_KEY = process.env.API_KEY;
    const API_SECRET = process.env.API_SECRET;

    const IDENTITY = event.Identity;

    const AccessToken = Twilio.jwt.AccessToken;
    const SyncGrant = AccessToken.SyncGrant;

    const syncGrant = new SyncGrant({
      serviceSid: TWILIO_SYNC_SERVICE
    });

    const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);
    accessToken.addGrant(syncGrant);
    accessToken.identity = IDENTITY;
    response.setBody({ token: accessToken.toJwt() });
    callback(null, response);
  }
  catch(err) {
    console.log('ERROR caught: ', err);
    callback(err, response);
  }
};
