import React from 'react';
import { Router,Route,Switch } from 'react-router-dom';

import Header from './Header';
import InvestmentList from './investments/InvestmentList';
import InvestmentCreate from './investments/InvestmentCreate';
import InvestmentShow from './investments/InvestmentShow';
import history from '../history';
import { Grid } from 'semantic-ui-react';
import VerticalMenu from './VerticalMenu';

const App = () => {
  return (
    <div className="ui ">
      <Router history={history}>
        <Header />
        <Grid columns='equal'>
          <Grid.Row>
            <Grid.Column width={4}>
              <VerticalMenu />
            </Grid.Column>
            <Grid.Column>
              <Switch>
                <Route path="/" exact component={InvestmentList} />
                <Route path="/investments/new" exact component={InvestmentCreate} />
                <Route path="/investments/:address" exact component={InvestmentShow} />
              </Switch>
            </Grid.Column>
          </Grid.Row>
        </Grid>

      </Router>
    </div>
  );
};

export default App;