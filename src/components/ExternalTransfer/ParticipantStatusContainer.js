/*
  This component is added to the narrow-width ParticipantCanvas which has a
  vertical list of small participant tiles.
  It provides a container for ParticipantStatus and ParticipantName.
*/
import * as React from 'react';
import styled from '@emotion/styled';
import {
  withTheme,
} from '@twilio/flex-ui';
import ParticipantName from './ParticipantName';
import ParticipantStatus from './ParticipantStatus';

const StatusContainer = styled('div')`
  display: flex;
  flex-wrap: nowrap;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: column;
  overflow: hidden;
`;

class ParticipantStatusContainer extends React.PureComponent {
  render() {
    return (
      <StatusContainer>
        <ParticipantName key="custom-name" {...this.props} />
        <ParticipantStatus key="custom-status" {...this.props} />
      </StatusContainer>
    );
  }
}

export default withTheme(ParticipantStatusContainer);
