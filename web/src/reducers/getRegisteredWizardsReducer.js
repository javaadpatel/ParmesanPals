import { 
    FETCH_REGISTERED_WIZARDS 
  } from '../actions/types';
  
  const initialState = {
    loading: false,
    wizards: [],
    error: false
  };
  
  export default (state = initialState, { type, payload }) => {
    switch (type) {
      case FETCH_REGISTERED_WIZARDS:
        return { ...state, registeredWizards: payload.registeredWizards  };
      default:
        return state;
    }
  }