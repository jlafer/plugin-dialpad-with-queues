# Native Flex Dialpad Add-on - With Queue Extensions

The native Flex Dialpad does not support agent-to-agent direct calls or external transfers yet. The flex-dialpad-addon-plugin is meant to be an add-on to the native Flex Diapad, adding both agent-to-agent direct calls and external transfers.

THIS plugin (jlafer/plugin-dialpad-with-queues) is an extension of the above and demonstrates one way of adding the following features:
- direct-dialing through queues
- putting the caller on hold before consulting or transferring to an external party
- receiving dialing status notifications when a third-party is being added to the existing (conference) call

PLEASE NOTE: in addition to the setup needed for flex-dialpad-addon-plugin (described below), this plugin requires creation of a Sync map. The following CLI command can be used:
`twilio api:sync:v1:services:maps:create --service-sid ISxxxx --unique-name=DialingEventsMap`

To use the Sync map, three additional environment variables must be added to the serverless .env file: `API_KEY`, `API_SECRET` and `TWILIO_SYNC_SERVICE`. If you don't have one already, get a new API key SID and secret from the Twilio Console and enter those values for the first two environment variables above. The SID for the default Twilio Sync Service or a custom service can be entered in the third variable.

## Flex plugin

A Twilio Flex Plugin allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

## How it works

This plugin uses Twilio Functions and WorkerClient's createTask method to create conferences and TaskRouter tasks for orchestration in both agent-to-agent calls and external transfers features. 

### Agent-to-agent direct call

This part adds a call agent section to the *Outbound Dialer Panel*. In this section, there is a dropdown where you can select the agent you want to call directly. After selecting and clicking the call button, the WorkerClient's createTask method is used to create the outbound call task having the caller agent as target. When the task is sent to this agent, the AcceptTask action is overridden so we can control all the calling process. Then, we use the reservation object inside the task payload to call the caller agent. This reservation object is part of the TaskRouter Javascript SDK bundled with Flex. The URL endpoint of this call is used and pointed to a Twilio Function that retuns a TwiML which in turns create a conference and sets the statusCallbackEvent. The latter endpoint will be used to create the called agent task.

In the called side, the AcceptTask action is also overridden and a similar calling process is done. The difference is that the URL endpoint points to a different Twilio Function that returns a simple TwiML which in turns calls the conference created on the caller side. 

This feature is based on the work on this [project](https://github.com/lehel-twilio/plugin-dialpad).

### External transfer

When in a call, a "plus" icon is added to the Call Canvas where you can add a external number to the call. This action executes a Twilio Function that uses the Twilio API to make a call and add this call to the current conference. In the Flex UI side, the participant is added manually and both hold/unhold and hangup buttons are available.   

This feature is based on the work on this [project](https://github.com/twilio-labs/plugin-flex-outbound-dialpad).

# Configuration


## Flex Plugin

This repository is a Flex plugin with some other assets. The following describing how you setup, develop and deploy your Flex plugin.

### Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

Afterwards, install the dependencies by running `npm install`:

```bash
cd 

# If you use npm
npm install
```

### Development

In order to develop locally, you can use the Webpack Dev Server by running:

```bash
npm start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:8080`. If you want to change that you can do this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

When you make changes to your code, the browser window will be automatically refreshed.

### Deploy

Once you are happy with your plugin, you have to bundle it in order to deploy it to Twilio Flex.

Run the following command to start the bundling:

```bash
npm run build
```

Afterwards, you'll find in your project a `build/` folder that contains a file with the name of your plugin project. For example, `plugin-example.js`. Take this file and upload it into the Assets part of your Twilio Runtime.

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex to provide them globally.

## TaskRouter

Before using this plugin you must first create a dedicated TaskRouter workflow or just add the following filter to your current workflow. Make sure it is part of your Flex Task Assignment workspace.

- ensure the following matching worker expression: *task.targetWorker==worker.contact_uri*
- ensure the priority of the filter is set to 1000 (or at least the highest in the system)
- make sure the filter matches to a queue with Everyone on it. The default Everyone queue will work but if you want to seperate real time reporting for outbound calls, you should make a dedicated queue for it with a queue expression
*1==1*

<img width="700px" src="screenshots/outbound-filter.png"/>

## Twilio Serverless 

You will need the [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) and the [serverless plugin](https://www.twilio.com/docs/labs/serverless-toolkit/getting-started) to deploy the functions inside the ```serverless``` folder of this project. You can install the necessary dependencies with the following commands:

`npm install twilio-cli -g`

and then

`twilio plugins:install @twilio-labs/plugin-serverless`

# How to use

1. Setup all dependencies above: the workflow and Twilio CLI packages.

2. Clone this repository

3. Copy .env.example to .env.development and to .env.production and set the following variables:

    - REACT_APP_SERVICE_BASE_URL: your Twilio Functions base url (this will be available after you deploy your functions). In local development environment, it could be your localhost base url. 
    - REACT_APP_TASK_CHANNEL_SID: the voice channel SID 

  **Note**: Remember that both .env.development and .env.production is for front-end use so do not add any type of key/secret variable to them. When developing, the .env.development is used while the .env.production is used when building and deploying the plugin. Also, just variables starting with the name *REACT_APP_* will work.
  

4.  run `npm install`

5. copy ./serverless/.env.sample to ./serverless/.env and populate the appropriate environment variables.

6.  cd into ./serverless/ then run `npm install` and then `twilio serverless:deploy` (optionally you can run locally with `twilio serverless:start --ngrok=""`

8. cd back to the root folder and run `npm start` to run locally or `npm run-script build` and deploy the generated ./build/plugin-dialpad.js to [twilio assests](https://www.twilio.com/console/assets/public) to include plugin with hosted Flex

# Known issues

1. When in an agent-to-agent call, the transfer button is disabled. 
2. When in an agent-to-agent call, an external transfer is done correctly but the UI does not reflect what is going on.

# Old issues 

**Note**: If you are suffering from any of the following issues, please update your plugin with the last version of this repository. 

1. In the first versions, the environment variables were set by the UI Configuration (please refer to this [documentation](https://www.twilio.com/docs/flex/ui/configuration)) but it was overriding some other variables with no relation to this plugin. Because of that, some features inside Flex were breaking. Now, there are two files (.env.development and .env.production) that gather all the environment variables. 
2. Before, the worker's contact_uri was extracted from `manager.user.identity` which has its problems depending on its format. It is now being extract from `manager.workerClient.attributes.contact_url` directly.  (Thanks to [@hgs-berlee](https://github.com/hgs-berlee) who pointed that out and suggested this solution) 
3. Before, when in an external transfer, the hold/unhold button was executing these actions on the first participant and not on the correct one. Now, this is fixed.
