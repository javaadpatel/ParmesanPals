import { 
  FETCH_WIZARDS_SUCCESS, 
  FETCH_WIZARDS_ERROR, 
  FETCH_WIZARDS_LOADING, 
} from '../actions/types';

const initialState = {
  loading: false,
  wizards: [],
  error: false
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case FETCH_WIZARDS_LOADING:
      return { ...state, loading: true, ownedWizards: [] };
    case FETCH_WIZARDS_SUCCESS:
      return { ...state, loading: false, ownedWizards: payload.ownedWizards };
    case FETCH_WIZARDS_ERROR:
      return { ...state, loading: false, ownedWizards: [], error: true };
    default:
      return state;
  }
}