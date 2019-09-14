import React from 'react';
import { Card, Icon, Button, Grid} from 'semantic-ui-react';
import Modal from '../Modal';
import WizardRegistrationFrom from './WizardRegistrationForm';

class WizardCard extends React.Component{
  state = {showRegistrationModal: false, selectedWizardId: null}

  renderRegistrationModalContent = () => {
    return (
        <Grid>
          <Grid.Row centered>
            <Grid.Column width={6}>
            <WizardRegistrationFrom wizardId={this.props.wizard.id} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
    );
  }


  renderRegistrationModal = () =>{
    if (this.state.showRegistrationModal){
      return (
        <Modal 
        title={`Register wizard ${this.state.selectedWizardId} for power exchange`}
        content={this.renderRegistrationModalContent()}
        // actions={this.renderRegistrationClaimModalActions()}
        onDismiss={() => this.setState({showRegistrationModal: false})}
        />
        )
    }
  }

  renderPowerRegistrationButton(){
    return(
    <Button fluid onClick={() => this.setState({showRegistrationModal: true, selectedWizardId: this.props.wizard.id})}>
      Register 
    </Button>
    )
  }  

  render(){
  const { id, owner, affinity, initialPower, power, eliminatedBlockNumber, createdBlockNumber } = this.props.wizard;
  return (
    <Card>
      <Card.Content>
        <Card.Header>Wizard ID: {id}</Card.Header>
        <Card.Meta>
          <p style={{ wordWrap: 'break-word' }}>Owner: {owner}</p>
        </Card.Meta>
        <Card.Description>
          <p> <Icon color='olive' name='leaf' size='large' /> Affinity: {affinity}</p>
          <p><Icon color='teal' name='lightning' size='large' /> Initial Power: {initialPower}</p>
          <p><Icon color='yellow' name='lightning' size='large' /> Current Power: {power}</p>
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <p>Created at block number: {createdBlockNumber}</p>
        <p>Eliminated at block number: {eliminatedBlockNumber || 'null'}</p>
        {this.renderPowerRegistrationButton()}
        {this.renderRegistrationModal()}
      </Card.Content>
    </Card>
  );
  }
}

export default WizardCard;