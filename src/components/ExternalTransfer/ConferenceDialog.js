/*
  This is a modal dialog that supports dialing an external number for the purpose
  of adding the dialed party to an agent call, thus forming a three-way conference.
  When the 'Call' button is pressed, its addConferenceParticipant method is
  called, which calls functions from ConferenceService.
*/
import * as React from 'react';
import { connect } from 'react-redux';
import { Actions, withTheme, Manager, withTaskContext } from '@twilio/flex-ui';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';
import ConferenceService from '../../helpers/ConferenceService';

class ConferenceDialog extends React.Component {
  state = {
    conferenceTo: ''
  }

  handleClose = () => {
    this.closeDialog();
  }

  closeDialog = () => {
    Actions.invokeAction('SetComponentState', {
      name: 'ConferenceDialog',
      state: { isOpen: false }
    });
  }

  handleKeyPress = e => {
    const key = e.key;
    if (key === 'Enter') {
      this.addConferenceParticipant();
      this.closeDialog();
    }
  }

  handleChange = e => {
    const value = e.target.value;
    this.setState({ conferenceTo: value });
  }

  handleDialButton = () => {
    this.addConferenceParticipant();
    this.closeDialog();
  }

  /*
    This controller function initates adding an external party to the current
    conference. It does so by invoking the HoldCall action and then calling
    two functions from the ConferenceService:
    participantCallSid = addParticipant(mainConferenceSid, from, to) and
    addConnectingParticipant(mainConferenceSid, participantCallSid, 'unknown')
  */
  addConferenceParticipant = async () => {
    const to = this.state.conferenceTo;
    const { task } = this.props;
    // JLAFER override to demonstrate getting conferenceSid from state via props
    //const conference = task && (task.conference || {});
    //const { conferenceSid } = conference;
    //const mainConferenceSid = task.attributes.conference ? 
    //  task.attributes.conference.sid : conferenceSid;
    const mainConferenceSid = this.props.conferenceSid;
    let from;
    if (this.props.phoneNumber) {
      from = this.props.phoneNumber
    } else {
      from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    }

    // JLAFER added to ensure caller is on hold before adding new party
    Actions.invokeAction('HoldCall', {task});

    // adding entered number to the conference
    console.log(`Adding ${to} to conference`);
    let participantCallSid;
    try {
      participantCallSid = await ConferenceService.addParticipant(
        mainConferenceSid,  // name of the current conference
        from,               // callerid
        to                  // dialed number
      );
      ConferenceService.addConnectingParticipant(
        mainConferenceSid,  // name of the conference
        participantCallSid, // callSid for the call to the new party
        'unknown'           // participant type - used in Flex state
      );
    } catch (error) {
      console.error('Error adding conference participant:', error);
    }
    this.setState({ conferenceTo: '' });
  }

  render() {
    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.handleClose}
      >
        <DialogContent>
          <DialogContentText>
            {Manager.getInstance().strings.DIALPADExternalTransferPhoneNumberPopupHeader}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="conferenceNumber"
            label={Manager.getInstance().strings.DIALPADExternalTransferPhoneNumberPopupTitle}
            fullWidth
            value={this.state.conferenceTo}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.handleDialButton}
            color="primary"
          >
            {Manager.getInstance().strings.DIALPADExternalTransferPhoneNumberPopupDial}
          </Button>
          <Button
            onClick={this.closeDialog}
            color="secondary"
          >
            {Manager.getInstance().strings.DIALPADExternalTransferPhoneNumberPopupCancel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  const componentViewStates = state.flex.view.componentViewStates;
  const conferenceDialogState = componentViewStates && componentViewStates.ConferenceDialog;
  const isOpen = conferenceDialogState && conferenceDialogState.isOpen;
  // JLAFER add conferenceSid from custom state, when set
  const {voiceConference} = state.dialpad.customConference;
  const conferenceSid = (voiceConference) ? voiceConference.conferenceSid : null;;
  return {
    isOpen,
    phoneNumber: state.flex.worker.attributes.phone,
    conferenceSid
  };
};

export default connect(mapStateToProps)(withTheme(withTaskContext(ConferenceDialog)));
