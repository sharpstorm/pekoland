import React, { Fragment, useState, useEffect } from 'react';
import { Route, Link, useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import Logo from './logo';
import BackgroundOverlay from './background-overlay';
import { RouteAnimatorSwitch } from './animator/animator-switch';
import { AnimSlideOut } from './animator/animations';
import { TextInput, Button } from './forms/form-components';
import { ArrowLeft } from './icons';

export default function FrontPageView() {
  const [isHidden, setIsHidden] = useState(false);
  const [fastForward, setFastForward] = useState(false);
  const history = useHistory();

  function LoginView() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErr, setLoginErr] = useState('');
    const [formState, setFormState] = useState(0);
    const identity = useIdentityContext();

    useEffect(() => {
      if (identity.user
        && identity.user.app_metadata
        && identity.user.app_metadata.roles
        && identity.user.app_metadata.roles.includes('banned')) {
        identity.logout();
      }
    }, [identity.user]);

    function validateLogin() {
      return loginEmail.length > 0 && loginPassword.length > 0;
    }

    function loginUser(evt) {
      evt.preventDefault();
      setFormState(1);

      identity.login({
        email: loginEmail,
        password: loginPassword,
      })
        .then((response) => {
          if (response.app_metadata && response.app_metadata.roles && response.app_metadata.roles.includes('banned')) {
            identity.logout();
            setLoginErr('You are currently banned');
            setFormState(0);
            setTimeout(() => setLoginErr(''), 4000);
          } else {
            setIsHidden(true);
            history.replace('/home');
          }
        })
        .catch((err) => {
          setLoginErr(err.message);
          setFormState(0);
          setTimeout(() => setLoginErr(''), 4000);
        });
    }

    return (
      <>
        <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
          <h1>Welcome!</h1>
          <form className="flexbox flex-col">
            <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
              <TextInput type="email" placeholder="Email" style={{ flex: '1 1 0' }} onChange={(evt) => setLoginEmail(evt.target.checkValidity() ? evt.target.value : '')} value={loginEmail} disabled={!(formState === 0)} />
            </div>
            <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
              <TextInput type="password" placeholder="Password" style={{ flex: '1 1 0' }} onChange={(evt) => setLoginPassword(evt.target.value)} value={loginPassword} disabled={!(formState === 0)} />
            </div>
            <span style={{ opacity: (loginErr === '') ? 0 : 1, height: '1em', transition: 'opacity 0.3s ease-in' }}>{loginErr}</span>
            <Button
              type="submit"
              className={`btn btn-primary${['', ' loading', ' tick'][formState]}`}
              style={{ width: '100%', maxWidth: '300px', margin: '1.5rem auto 8px' }}
              onClick={loginUser}
              disabled={!validateLogin()}
            >
              Login
            </Button>
            <Link className="link" to="/login/forget">Forgot Your Password?</Link>
          </form>
        </div>
        <div className="panel panel-sm panel-dark flexbox flex-center" style={{ marginTop: '8px' }}>
          <Link className="link" to="/login/register">Dont Have An Account?</Link>
        </div>
      </>
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
          ign: registerIgn,
        },
      })
        .then(() => setFormState(2))
        .catch((err) => {
          setErrorMsg(err.message);
          setFormState(3);
        });
    }

    return (
      <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        {(formState < 2) ? (
          <>
            <div style={{ marginTop: '8px', marginLeft: '8px' }}>
              <Link to="/login">
                <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
              </Link>
            </div>
            <h1 style={{ marginTop: 0 }}>Tell Me About Yourself</h1>
            <form className="flexbox flex-col">
              <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
                <TextInput type="email" placeholder="Email" style={{ flex: '1 1 0' }} onChange={(evt) => setRegisterEmail(evt.target.checkValidity() ? evt.target.value : '')} value={registerEmail} disabled={!(formState === 0)} />
              </div>
              <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
                <TextInput type="password" placeholder="Password" style={{ flex: '1 1 0' }} onChange={(evt) => setRegisterPassword(evt.target.value)} value={registerPassword} disabled={!(formState === 0)} />
              </div>
              <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
                <TextInput type="password" placeholder="Repeat Password" style={{ flex: '1 1 0' }} onChange={(evt) => setRegisterPassword2(evt.target.value)} value={registerPassword2} disabled={!(formState === 0)} />
              </div>
              <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
                <TextInput type="text" placeholder="In-Game Name" style={{ flex: '1 1 0' }} onChange={(evt) => setRegisterIgn(evt.target.value)} value={registerIgn} disabled={!(formState === 0)} />
              </div>
              <Button type="submit" className={`btn-primary${(formState === 0) ? '' : ' loading'}`} style={{ maxWidth: '300px', margin: '2rem auto 8px' }} onClick={registerUser} disabled={!validateRegister()}>Register</Button>
            </form>
          </>
        ) : null}
        {(formState === 2) ? (
          <>
            <h1>Registration Successful</h1>
            <div>
              Please Check Your Email to Verify Your Account
            </div>
            <Link to="/login">
              <button type="button" style={{ maxWidth: '300px', margin: '2rem auto 8px' }} className="btn btn-primary">Back to Login</button>
            </Link>
          </>
        ) : null}
        {(formState === 3) ? (
          <>
            <h1>Registration Failed</h1>
            <div>{errorMsg}</div>
            <button type="button" style={{ maxWidth: '300px', margin: '2rem auto 8px' }} className="btn btn-primary" onClick={() => setFormState(0)}>Try Again</button>
          </>
        ) : null}
      </div>
    );
  }

  function ForgetView() {
    const [email, setEmail] = useState('');
    const [err, setErr] = useState('');
    const [formState, setFormState] = useState(0);
    const identity = useIdentityContext();

    function validateForm() {
      return email.length > 0;
    }

    function submitForgetPassword(evt) {
      evt.preventDefault();
      setFormState(1);

      identity.sendPasswordRecovery({ email })
        .then(() => setFormState(2))
        .catch((e) => {
          setErr(e.message);
          setFormState(0);
        });
    }

    return (
      <>
        <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
          <div style={{ marginTop: '8px', marginLeft: '8px' }}>
            <Link to="/login">
              <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
            </Link>
          </div>
          { formState < 2 ? (
            <>
              <h1 style={{ marginTop: 0 }}>Forgotten Password</h1>
              <form className="flexbox flex-col">
                <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
                  <TextInput type="email" placeholder="Email" style={{ flex: '1 1 0' }} onChange={(evt) => setEmail(evt.target.checkValidity() ? evt.target.value : '')} value={email} disabled={!(formState === 0)} />
                </div>
                <span style={{ opacity: (err === '') ? 0 : 1, height: '1em', transition: 'opacity 0.3s ease-in' }}>{err}</span>
                <Button
                  type="submit"
                  className={`btn btn-primary${['', ' loading', ' tick'][formState]}`}
                  style={{ width: '100%', maxWidth: '300px', margin: '1.5rem auto 8px' }}
                  onClick={submitForgetPassword}
                  disabled={!validateForm()}
                >
                  Reset
                </Button>
              </form>
            </>
          ) : (
            <div className="flexbox flex-col">
              <h2>Password Reset Requested</h2>
              <span>Please Check Your Registered Email</span>
            </div>
          )}
        </div>
      </>
    );
  }

  function ResetView() {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [err, setErr] = useState('');
    const [formState, setFormState] = useState(3);
    const identity = useIdentityContext();

    function validateForm() {
      return password.length > 0 && password2.length > 0 && password === password2;
    }

    function submitForgetPassword(evt) {
      evt.preventDefault();
      setFormState(1);

      identity.completeUrlTokenTwoStep({ password })
        .then(() => setFormState(2))
        .catch(() => {
          setErr('An Error Occurred. Please Try Again!');
          setFormState(0);
        });
    }

    useEffect(() => {
      if (formState < 3) {
        return;
      }
      if (!identity.urlToken) {
        setFormState(4);
      } else if (identity.urlToken && identity.user) {
        setFormState(0);
      }
    }, [identity.urlToken, identity.user]);

    let page;
    if (formState < 2) {
      page = (
        <>
          <h1 style={{ marginTop: 0 }}>Choose Your New Password</h1>
          <form className="flexbox flex-col">
            <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
              <TextInput type="password" placeholder="Password" style={{ flex: '1 1 0' }} onChange={(evt) => setPassword(evt.target.value)} value={password} disabled={!(formState === 0)} />
            </div>
            <div style={{ width: '100%', maxWidth: '400px', margin: '4px auto' }} className="flexbox">
              <TextInput type="password" placeholder="Repeat Password" style={{ flex: '1 1 0' }} onChange={(evt) => setPassword2(evt.target.value)} value={password2} disabled={!(formState === 0)} />
            </div>
            <span style={{ opacity: (err === '') ? 0 : 1, height: '1em', transition: 'opacity 0.3s ease-in' }}>{err}</span>
            <Button
              type="submit"
              className={`btn btn-primary${['', ' loading', ' tick'][formState]}`}
              style={{ width: '100%', maxWidth: '300px', margin: '1.5rem auto 8px' }}
              onClick={submitForgetPassword}
              disabled={!validateForm()}
            >
              Reset
            </Button>
          </form>
        </>
      );
    } else if (formState < 3) {
      page = (
        <div className="flexbox flex-col">
          <h2>Password Successfully Reset</h2>
          <Link to="/login"><Button className="btn-primary">Go To Login</Button></Link>
        </div>
      );
    } else if (formState < 4) {
      page = (
        <div className="flexbox flex-col">
          <h1>Validating Link</h1>
        </div>
      );
    } else {
      page = (
        <div className="flexbox flex-col">
          <h1>Invalid Link</h1>
        </div>
      );
    }
    return (
      <>
        <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
          <div style={{ marginTop: '8px', marginLeft: '8px' }}>
            <Link to="/login">
              <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
            </Link>
          </div>
          {page}
        </div>
      </>
    );
  }

  function ConfirmationView() {
    const [formState, setFormState] = useState(0);
    const identity = useIdentityContext();

    useEffect(() => {
      if (!identity.urlToken && !identity.goTrueToken) {
        setFormState(2);
      } else if (identity.goTrueToken) {
        setFormState(1);
      }
    }, [identity.urlToken, identity.goTrueToken]);

    let page;
    if (formState < 1) {
      page = (
        <div className="flexbox flex-col">
          <h1>Validating Link</h1>
        </div>
      );
    } else if (formState < 2) {
      page = (
        <div className="flexbox flex-col">
          <h2>Account Successfully Confirmed</h2>
          <Link to="/login"><Button className="btn-primary">Go To Login</Button></Link>
        </div>
      );
    } else {
      page = (
        <div className="flexbox flex-col">
          <h1>Invalid Link</h1>
        </div>
      );
    }

    return (
      <>
        <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
          <div style={{ marginTop: '8px', marginLeft: '8px' }}>
            <Link to="/login">
              <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
            </Link>
          </div>
          {page}
        </div>
      </>
    );
  }

  const identity = useIdentityContext();
  useEffect(() => {
    if (identity.urlToken?.type === 'confirmation') {
      setFastForward(true);
      history.replace('/login/confirm');
    } else if (identity.urlToken?.type === 'recovery') {
      setFastForward(true);
      history.replace('/login/reset');
    }
  }, [identity.urlToken]);

  return (
    <>
      <BackgroundOverlay isVisible={!isHidden} />
      <div style={{ overflow: 'hidden' }}>
        <Logo style={{ marginBottom: '16px' }} />
        <div style={{
          width: '100%',
          margin: 'auto',
          maxWidth: '1200px',
          position: 'relative',
          overflow: 'hidden',
        }}
        >
          <RouteAnimatorSwitch animator={AnimSlideOut} fastForward={fastForward} onChange={() => setFastForward(false)} path="*">
            <Route exact path="/login/register" component={RegisterView} />
            <Route exact path="/login/forget" component={ForgetView} />
            <Route exact path="/login/reset" component={ResetView} />
            <Route exact path="/login/confirm" component={ConfirmationView} />
            <Route component={LoginView} />
          </RouteAnimatorSwitch>
        </div>
      </div>
    </>
  );
}
