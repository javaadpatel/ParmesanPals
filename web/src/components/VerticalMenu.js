import React,{ Component } from 'react';
import { Menu,Grid } from 'semantic-ui-react';
import { Route,Switch,Link } from 'react-router-dom';
import InvestmentList from './investments/InvestmentList';
import MyWizards from './investments/MyWizards';
import WizardDuel from './investments/WizardDuel';

export default class extends Component {
  constructor (props) {
    super(props);
  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  }

  render() {
    return (
      <Grid stackable columns='equal'>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu pointing secondary vertical>

              <Menu.Item as={Link} to='/'
                name='Home'
                active={window.location.pathname === '/'}
                onClick={this.handleItemClick}
              />
              <Menu.Item as={Link} to='/wizards'
                name='My Wizards'
                active={window.location.pathname === '/wizards'}
                onClick={this.handleItemClick}
              />
              <Menu.Item as={Link} to="/simulation"
                name='Duel Simulation'
                active={window.location.pathname === '/simulation'}
                onClick={this.handleItemClick}
              />
            </Menu>
          </Grid.Column>
          <Grid.Column>
            <Switch>
              <Route path="/" exact component={InvestmentList} />
              <Route path="/wizards" exact component={MyWizards} />
              <Route path="/simulation" exact component= {WizardDuel} />
            </Switch>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
