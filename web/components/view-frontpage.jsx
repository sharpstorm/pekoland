import React, {Fragment} from 'react';
import Logo from './logo';
import BackgroundOverlay from './background-overlay';
import { Route, Link } from 'react-router-dom';
import SwitchWithSlide from './animator/switch-with-slide';
import TextInput from './form-components';

class FrontPageView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <BackgroundOverlay/>
        <div style={{overflow: 'hidden'}}>
          <Logo style={{marginBottom: '16px'}}/>
          <SwitchWithSlide>
            <Route exact path='/' component={LoginView} />
            <Route exact path='/register' component={RegisterView} />
          </SwitchWithSlide>
        </div>
      </Fragment> 
    );
  }
}

function LoginView() {
  return (
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
        <Link className='link' to="/register">Dont Have An Account?</Link>
      </form>
    </div>
  );
}

function RegisterView() {
  return (
    <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
      <h1>Tell Me About Yourself</h1>
      <form className='flexbox flex-col'>
        <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
          <TextInput type='text' placeholder='Username' style={{flex: '1 1 0'}} />
        </div>
        <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
          <TextInput type='text' placeholder='Password' style={{flex: '1 1 0'}} />
        </div>
        <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
          <TextInput type='text' placeholder='In-Game Name' style={{flex: '1 1 0'}} />
        </div>
        <button className='btn btn-primary' style={{width: '100%', maxWidth: '300px', margin: '2rem auto 8px'}}>Register</button>
      </form>
    </div>
  );
}

export default FrontPageView;