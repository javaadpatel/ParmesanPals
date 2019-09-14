import { 
  CREATE_WIZARD_SUCCESS, 
  CREATE_WIZARD_ERROR 
} from '../actions/types';

const initialState = {
  successful: false,
  error: false
};

export default (state = initialState, { type }) => {
  switch (type) {
    case CREATE_WIZARD_SUCCESS:
    return { ...state, successful: true, error: false };
    case CREATE_WIZARD_ERROR:
      return { ...state, successful: false, error: true };
    default:
      return state;
  }
}