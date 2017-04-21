
function switcher(state = 'dashboard', action) {
  switch (action.type) {
    case 'dashboard':
      return 'slice';
    case 'slice':
      return 'dashboard';
    default:
      return state;
  }
}

export default switcher;
