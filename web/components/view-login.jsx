import React, {Fragment} from 'react';
import Logo from './logo';
import TextInput from './form-components';
import BackgroundOverlay from './background-overlay';

class LoginView extends React.Component {
  constructor(props) {
    super(props);


  }

  render() {
    return <Fragment>
      <BackgroundOverlay/>
      <div>
        <Logo style={{marginBottom: '16px'}}/>
        <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
          <h1>Welcome!</h1>
          <form className='flexbox flex-col'>
            <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
              <TextInput type='text' placeholder='Username' style={{flex: '1 1 0'}} />
            </div>
            <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
              <TextInput type='text' placeholder='Password' style={{flex: '1 1 0'}} />
            </div>
            <button className='btn btn-primary' style={{width: '100%', maxWidth: '300px', margin: '2rem auto 8px'}}>Login</button>
            <a className='link' href='#'>Dont Have An Account?</a>
          </form>
        </div>
      </div>
    </Fragment> 
  }
}

export default LoginView;