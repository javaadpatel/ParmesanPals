import React from 'react';
import { Router,Route,Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from './Header';
import history from '../history';
import VerticalMenu from './VerticalMenu';
import { registerOnEthProviderUpdate } from '../actions/index';

const App = (props) => {
  props.registerEthProviderUpdate();
  return (
    <div className="ui ">
      <Router history={history}>
        <Header />
        <VerticalMenu />
      </Router>
    </div>
  );
};

const mapStateToProps = (state) => {
  console.log('state ', state);
  return {
    selectedAddress: state.ethProvider.selectedAddress,
    incorrectNetworkSelected: state.ethProvider.incorrectNetworkSelected
  };
}

const mapDispatchToProps = dispatch => ({
  registerEthProviderUpdate: () => dispatch(registerOnEthProviderUpdate())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);