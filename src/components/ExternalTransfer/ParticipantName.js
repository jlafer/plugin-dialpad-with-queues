/*
  This component is added to the full-width ParticipantCanvas.
  On mounting, it requests the call info for the participant from the serverless
  function 'external-transfer/get-call-properties'. It renders the 'to'
  property of the call object.
*/
import * as React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { Manager, withTheme } from '@twilio/flex-ui';
import { request } from '../../helpers/request';

const Name = styled('div')`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NameListItem = styled('div')`
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

class ParticipantName extends React.Component {
  state = {
    name: ''
  };

  componentDidMount() {
    const { participant, task } = this.props;

    if (participant.participantType === 'customer') {
      // NOTE: attributes.outbound_to is set by workerClient.createTask from the 'to' parameter
      this.setState({ name: task.attributes.outbound_to || task.attributes.name });
      return;
    }

    if (participant.participantType === 'unknown') {
      request('external-transfer/get-call-properties', Manager.getInstance(), {
        callSid: participant.callSid
      }).then(response => {
        if (response) {
          const name = (response && response.to) || 'unknown';
          this.setState({ name });
        }
      });
    } else {
      this.setState({ name: participant.worker ? participant.worker.fullName : 'unknown' });
    }
  }

  render() {
    return this.props.listMode
      ? (
        <NameListItem className="ParticipantCanvas-Name">
          {this.state.name}
        </NameListItem>
      ) : (
        <Name className="ParticipantCanvas-Name">
          {this.state.name}
        </Name>
      );
  }
}

const mapStateToProps = state => {
  const { serviceBaseUrl } = state.flex.config;

  return {
    serviceBaseUrl,
  };
};

export default connect(mapStateToProps)(withTheme(ParticipantName));
