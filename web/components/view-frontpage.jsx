import React, {Fragment, useState} from 'react';
import Logo from './logo';
import BackgroundOverlay from './background-overlay';
import { Route, Link } from 'react-router-dom';
import AnimatorSwitch from './animator/animator-switch';
import { AnimSlideOut } from './animator/animations';
import TextInput from './form-components';
import { useIdentityContext } from 'react-netlify-identity-gotrue';

export default function FrontPageView() {
  function LoginView() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    function validateLogin() {
      return loginEmail.length > 0 && loginPassword.length > 0;
    }
    
    function loginUser(evt) {
      evt.preventDefault();

      
    }

    return (
      <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
        <h1>Welcome!</h1>
        <form className='flexbox flex-col'>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='email' placeholder='Email' style={{flex: '1 1 0'}} onChange={(evt) => setLoginEmail(evt.target.value)} value={loginEmail} />
          </div>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='password' placeholder='Password' style={{flex: '1 1 0'}} onChange={(evt) => setLoginPassword(evt.target.value)} value={loginPassword} />
          </div>
          <button className='btn btn-primary' style={{width: '100%', maxWidth: '300px', margin: '2rem auto 8px'}}
            onClick={loginUser} disabled={!validateLogin()}>Login</button>
          <Link className='link' to="/register">Dont Have An Account?</Link>
        </form>
      </div>
    );
  }
  
  function RegisterView() {
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPassword2, setRegisterPassword2] = useState('');
    const [registerIgn, setRegisterIgn] = useState('');
    const identity = useIdentityContext();

    function validateRegister() {
      return registerEmail.length > 0 
        && registerPassword.length > 0 
        && registerPassword2.length > 0 
        && registerIgn.length > 0
        && registerPassword === registerPassword2;
    }

    function registerUser(evt) {
      evt.preventDefault();
  
      identity.signup({
        email: registerEmail,
        password: registerPassword,
        user_metadata: {
          ign: registerIgn
        }
      })
      .then(() => {})
      .catch(e => {});
    }

    return (
      <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
        <h1>Tell Me About Yourself</h1>
        <form className='flexbox flex-col'>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='email' placeholder='Email' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterEmail(evt.target.value)} value={registerEmail} />
          </div>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='password' placeholder='Password' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterPassword(evt.target.value)} value={registerPassword} />
          </div>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='password' placeholder='Repeat Password' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterPassword2(evt.target.value)} value={registerPassword2} />
          </div>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='text' placeholder='In-Game Name' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterIgn(evt.target.value)} value={registerIgn} />
          </div>
          <button className='btn btn-primary' style={{width: '100%', maxWidth: '300px', margin: '2rem auto 8px'}} onClick={registerUser} disabled={!validateRegister()}>Register</button>
        </form>
      </div>
    );
  }

  return (
    <Fragment>
      <BackgroundOverlay/>
      <div style={{overflow: 'hidden'}}>
        <Logo style={{marginBottom: '16px'}}/>
        <div style={{width: '100%', margin:'auto', maxWidth:'1200px', position:'relative', overflow: 'hidden'}}>
          <AnimatorSwitch animator={AnimSlideOut}>
            <Route exact path='/' component={LoginView} />
            <Route exact path='/register' component={RegisterView} />
          </AnimatorSwitch>
        </div>
      </div>
    </Fragment> 
  );
}