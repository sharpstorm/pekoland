import React, {Fragment, useState} from 'react';
import Logo from './logo';
import BackgroundOverlay from './background-overlay';
import { Route, Link, useHistory } from 'react-router-dom';
import { RouteAnimatorSwitch } from './animator/animator-switch';
import { AnimSlideOut } from './animator/animations';
import { TextInput, Button } from './forms/form-components';
import { useIdentityContext } from 'react-netlify-identity-gotrue';
import { ArrowLeft } from './icons';


export default function FrontPageView(props) {
  const [isHidden, setIsHidden] = useState(false);
  const history = useHistory();

  function LoginView() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [formState, setFormState] = useState(0);
    const identity = useIdentityContext();

    function validateLogin() {
      return loginEmail.length > 0 && loginPassword.length > 0;
    }
    
    function loginUser(evt) {
      evt.preventDefault();
      setFormState(1);

      identity.login({
        email: loginEmail,
        password: loginPassword
      }).then(() => {
        setIsHidden(true);
      })
      .catch(err => {
        setLoginErr(err.message);
        setFormState(0);
        setTimeout(() => setLoginErr(''), 4000);
      });
    }

    return (
      <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
        <h1>Welcome!</h1>
        <form className='flexbox flex-col'>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='email' placeholder='Email' style={{flex: '1 1 0'}} onChange={(evt) => setLoginEmail(evt.target.value)} value={loginEmail} disabled={!(formState === 0)} />
          </div>
          <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
            <TextInput type='password' placeholder='Password' style={{flex: '1 1 0'}} onChange={(evt) => setLoginPassword(evt.target.value)} value={loginPassword} disabled={!(formState === 0)} />
          </div>
          <span style={{ opacity: (loginErr === '') ? 0 : 1, height: '1em', transition: 'opacity 0.3s ease-in' }}>{loginErr}</span>
          <Button className={'btn btn-primary' + ['', ' loading', ' tick'][formState]} style={{width: '100%', maxWidth: '300px', margin: '1.5rem auto 8px'}}
            onClick={loginUser} disabled={!validateLogin()}>Login</Button>
          <Link className='link' to='/login/register'>Dont Have An Account?</Link>
        </form>
      </div>
    );
  }
  
  function RegisterView() {
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPassword2, setRegisterPassword2] = useState('');
    const [registerIgn, setRegisterIgn] = useState('');
    const [formState, setFormState] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
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
      setFormState(1);

      identity.signup({
        email: registerEmail,
        password: registerPassword,
        user_metadata: {
          ign: registerIgn
        }
      })
      .then(() => setFormState(2))
      .catch(err => {
        setErrorMsg(err.message);
        setFormState(3);
      });
    }

    return (
      <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
        {(formState < 2) ? (
          <Fragment>
            <div style={{marginTop: '8px', marginLeft: '8px'}}>
              <Link to='/login'>
                <div style={{float: 'left'}}><ArrowLeft color='#FFF' size='2rem'/></div>
              </Link>
            </div>
            <h1 style={{marginTop: 0}}>Tell Me About Yourself</h1>
            <form className='flexbox flex-col'>
              <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
                <TextInput type='email' placeholder='Email' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterEmail(evt.target.checkValidity() ? evt.target.value : '')} value={registerEmail} disabled={!(formState === 0)} />
              </div>
              <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
                <TextInput type='password' placeholder='Password' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterPassword(evt.target.value)} value={registerPassword} disabled={!(formState === 0)} />
              </div>
              <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
                <TextInput type='password' placeholder='Repeat Password' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterPassword2(evt.target.value)} value={registerPassword2} disabled={!(formState === 0)} />
              </div>
              <div style={{width: '100%', maxWidth: '400px', margin: '4px auto'}} className='flexbox'>
                <TextInput type='text' placeholder='In-Game Name' style={{flex: '1 1 0'}} onChange={(evt) => setRegisterIgn(evt.target.value)} value={registerIgn} disabled={!(formState === 0)} />
              </div>
              <Button className={'btn-primary' + ((formState === 0) ? '' : ' loading')} style={{maxWidth: '300px', margin: '2rem auto 8px'}} onClick={registerUser} disabled={!validateRegister()}>Register</Button>
            </form>
          </Fragment>
        ) : null}
        {(formState === 2) ? (
          <Fragment>
            <h1>Registration Successful</h1>
            <div>
              Please Check Your Email to Verify Your Account
            </div>
            <Link to='/'>
              <button style={{maxWidth: '300px', margin: '2rem auto 8px'}} className='btn btn-primary'>Back to Login</button>
            </Link>
          </Fragment>
        ) : null}
        {(formState === 3) ? (
          <Fragment>
            <h1>Registration Failed</h1>
            <div>{errorMsg}</div>
            <button style={{maxWidth: '300px', margin: '2rem auto 8px'}} className='btn btn-primary' onClick={() => setFormState(0)}>Try Again</button>
          </Fragment>
        ) : null}
      </div>
    );
  }

  const identity = useIdentityContext();
  if (identity.urlToken?.type === 'confirmation') {
    alert('Confirming User');
  } else if (identity.urlToken?.type === 'passwordRecovery') {
    identity.completeUrlTokenTwoStep({
      password: 'password1'
    })
      .then(() => alert('Done Changing'))
      .catch(_ => setFormError('Having an issue.. please try later'))
  }

  return (
    <Fragment>
      <BackgroundOverlay isVisible={!isHidden} onChange={() => history.push('/home')} />
      <div style={{overflow: 'hidden'}}>
        <Logo style={{marginBottom: '16px'}}/>
        <div style={{width: '100%', margin:'auto', maxWidth:'1200px', position:'relative', overflow: 'hidden'}}>
        <Route
          render={({location}) => (
            <AnimSlideOut uniqKey={location.pathname} updateStep={undefined}>
              {location.pathname === '/login/register' ? (<RegisterView/>) : (<LoginView/>)}
            </AnimSlideOut>
          )}
        />

        </div>
      </div>
    </Fragment> 
  );
}