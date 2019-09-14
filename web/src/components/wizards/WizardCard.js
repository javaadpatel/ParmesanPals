import React from 'react';
import { Card, Icon, Button, Grid} from 'semantic-ui-react';
import Modal from '../Modal';
import WizardRegistrationFrom from './WizardRegistrationForm';
import {deregisterWizard} from '../../actions';
import {connect} from 'react-redux';
import {createLoadingSelector, createErrorMessageSelector} from '../../selectors';
import {DEREGISTER_WIZARD} from '../../actions/types';

class WizardCard extends React.Component{
  state = {showRegistrationModal: false, showDeregisterModal: false, selectedWizardId: null}

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

  renderDeregistrationModalContent = () => {
    return (
        <Grid>
          <Grid.Row centered>
            <Grid.Column width={6}>
             This will remove wizard from power exchange listing
            </Grid.Column>
          </Grid.Row>
        </Grid>
    );
  }

  renderDeregisterModalActions = () => {
    return(
      <>
       <Button primary onClick={() => this.props.deregisterWizard(this.props.wizard.id)} loading={this.props.isFetching}>
           Deregister Wizard
       </Button>
      </>
    )
  }

  renderDeregisterModal = () => {
    if (this.state.showDeregisterModal){
      return (
        <Modal 
        title={`Deregister wizard ${this.state.selectedWizardId} from power exchange`}
        content={this.renderDeregistrationModalContent()}
        actions={this.renderDeregisterModalActions()}
        onDismiss={() => this.setState({showDeregisterModal: false})}
        />
        )
    }
  }

  renderPowerRegistrationButton(){
    if (this.props.wizard.isRegistered){
      return(
        <Button fluid color='red' onClick={() => this.setState({showDeregisterModal: true, selectedWizardId: this.props.wizard.id})}>
          Unregister 
        </Button>
        )
    } else {
      return(
        <Button fluid primary onClick={() => this.setState({showRegistrationModal: true, selectedWizardId: this.props.wizard.id})}>
          Register 
        </Button>
        )
    }
  }  

  render(){
  const { id, owner, affinity, initialPower, power, eliminatedBlockNumber, createdBlockNumber, isRegistered } = this.props.wizard;
  console.log(isRegistered);
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
        {this.renderDeregisterModal()}
      </Card.Content>
    </Card>
  );
  }
}

const loadingSelector = createLoadingSelector([DEREGISTER_WIZARD]);
const errorSelector = createErrorMessageSelector([DEREGISTER_WIZARD]);
const mapStateToProps = (state) => {
    return {
        isFetching: loadingSelector(state),
        error: errorSelector(state)
    }
}

export default connect(mapStateToProps, {
  deregisterWizard
})(WizardCard);