import React,{ Component } from 'react';
import { Menu,Grid } from 'semantic-ui-react';
import { Route,Switch,Link } from 'react-router-dom';
import InvestmentList from './investments/InvestmentList';
import MyWizards from './investments/MyWizards';

export default class extends Component {
  constructor (props) {
    super(props);
    this.state = { activeItem: 'Home' };
  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name });
  }

  render() {
    const { activeItem } = this.state;

    return (
      <Grid columns='equal'>
        <Grid.Row>
          <Grid.Column width={4}>
            <Menu pointing secondary vertical>

              <Menu.Item as={Link} to='/'
                name='Home'
                active={activeItem === 'Home'}
                onClick={this.handleItemClick}
              />
              <Menu.Item as={Link} to='/wizards'
                name='My Wizards'
                active={activeItem === 'My Wizards'}
                onClick={this.handleItemClick}
              />
              <Menu.Item as={Link} to="/simulation"
                name='Duel Simulation'
                active={activeItem === 'Duel Simulation'}
                onClick={this.handleItemClick}
              />
            </Menu>
          </Grid.Column>
          <Grid.Column>
            <Switch>
              <Route path="/" exact component={InvestmentList} />
              <Route path="/wizards" exact component={MyWizards} />
            </Switch>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
