export default function reducer(state, action = {}) {
  const { type, payload = {} } = action;
  switch (type) {
    case "SET_STATE":
      return {
        ...state,
        ...payload,
      };
      
    case "SET_USER_PERSONAS":
      console.log('Reducer - Setting userPersonas:', payload);
      return {
        ...state,
        userPersonas: payload
      };

    default:
      return state;
  }
}
