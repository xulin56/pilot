
function switcher(state = {
	edit: 'dashboard',
	favorite: 'dashboard'
}, action) {
	let local = {};
	local.edit = state.edit;
	local.favorite = state.favorite;

  switch (action.type) {
    case 'edit':
    	local.edit = (action.value==='dashboard'?'slice':'dashboard');
    	return local;
   
    case 'favorite':
    	local.favorite = (action.value==='dashboard'?'slice':'dashboard');
    	return local;

    default:
      return local;
  }
}

export default switcher;
