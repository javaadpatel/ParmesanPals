import {combineReducers} from 'redux';
import {reducer as formReducer} from 'redux-form';
import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';
import getWizardsReducer from './getWizardsReducer';
import ethProviderReducer from './ethProviderReducer';
import createWizardReducer from './createWizardReducer';

export default combineReducers({
    form: formReducer,
    loading: loadingReducer,
    errors: errorReducer,
    fetchWizards: getWizardsReducer,
    ethProvider: ethProviderReducer,
    createWizard: createWizardReducer
});