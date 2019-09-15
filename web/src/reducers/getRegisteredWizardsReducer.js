import {
  FETCH_REGISTERED_WIZARDS,
  FETCH_REGISTERED_WIZARDS_LOADING,
  FETCH_REGISTERED_WIZARDS_ERROR
} from '../actions/types';

const initialState = {
  loading: false,
  registeredWizards: [],
  error: false
};

export default (state = initialState,{ type,payload }) => {
  switch (type) {
    case FETCH_REGISTERED_WIZARDS_LOADING:
      return { ...state,registeredWizards: [],loading: true };
    case FETCH_REGISTERED_WIZARDS:
      return { ...state,registeredWizards: payload.registeredWizards,loading: false,error: false };
    case FETCH_REGISTERED_WIZARDS_ERROR:
      return { ...state,registeredWizards: [],error: true,loading: false };
    default:
      return state;
  }
}