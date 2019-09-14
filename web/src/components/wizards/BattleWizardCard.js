import React from 'react';
import {Card, Icon, Button} from 'semantic-ui-react';
import {connect} from 'react-redux';

class BattleWizardCard extends React.Component{
    render(){
        const { id, affinity, power} = this.props.wizard;
        return (
            <Card>
                <Card.Content>
                    <Card.Header>Wizard ID: {id}</Card.Header>
                    {/* <Card.Meta>
                    <p style={{ wordWrap: 'break-word' }}>Owner: {owner}</p>
                    </Card.Meta> */}
                    <Card.Description>
                    <p> <Icon color='olive' name='leaf' size='large' /> Affinity: {affinity}</p>
                    {/* <p><Icon color='teal' name='lightning' size='large' /> Initial Power: {initialPower}</p> */}
                    <p><Icon color='yellow' name='lightning' size='large' /> Current Power: {power}</p>
                    </Card.Description>
                </Card.Content>
                    {/* <Card.Content extra>
                        <p>Created at block number: {createdBlockNumber}</p>
                        <p>Eliminated at block number: {eliminatedBlockNumber || 'null'}</p>
                    </Card.Content> */}
            </Card>
        )
    }
}

export default BattleWizardCard;