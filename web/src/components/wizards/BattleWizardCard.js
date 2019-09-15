import React from 'react';
import {Card, Icon} from 'semantic-ui-react';

class BattleWizardCard extends React.Component{
    render(){
        const { id, affinity, power} = this.props.wizard;
        return (
            <Card>
                <Card.Content>
                    <Card.Header>Wizard ID: {id}</Card.Header>
                    <Card.Description>
                    <p> <Icon color='olive' name='leaf' size='large' /> Affinity: {affinity}</p>
                    <p><Icon color='yellow' name='lightning' size='large' /> Current Power: {power}</p>
                    </Card.Description>
                </Card.Content>
            </Card>
        )
    }
}

export default BattleWizardCard;