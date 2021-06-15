import React, { useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { Button, TextInput } from './forms/form-components';
import { ArrowLeft } from './icons';

export default function SettingsView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    }
  }, [identity.ready]);

  function renderUserInfo(user) {
    return (
      <>
        <h1 style={{ marginTop: 0 }}>Account Information</h1>
        <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
          <div className="flexbox" style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '1.2em', flex: '1 1 50%' }}>Registered Email</div>
            <div className="flexbox flex-col flex-center" style={{ flex: '1 1 50%' }}>{user.email}</div>
          </div>
          <div className="flexbox" style={{ padding: '8px 0', borderTop: '1px solid #CCC' }}>
            <div style={{ fontSize: '1.2em', flex: '1 1 50%' }}>In-Game Name</div>
            <div className="flexbox flex-col flex-center" style={{ flex: '1 1 50%' }}>{ user.user_metadata.ign }</div>
          </div>
          <div className="flexbox" style={{ padding: '8px 0', borderTop: '1px solid #CCC' }}>
            <Button className="btn-accent" style={{ margin: '8px' }} onClick={() => setCurrentPage(1)}>Change Password</Button>
            <Button className="btn-accent" style={{ margin: '8px' }} onClick={() => setCurrentPage(2)}>Change In-Game Name</Button>
          </div>
        </div>
      </>
    );
  }

  function ChangePasswordPage() {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const submitPasswordChange = (evt) => {
      evt.preventDefault();
      identity.update({
        password,
      })
        .then(() => {
          alert('Password Successfully Updated');
          setCurrentPage(0);
        });
    };

    function validateForm() {
      return password.length > 0 && password2.length > 0 && password === password2;
    }

    return (
      <>
        <h1 style={{ marginTop: 0 }}>Password Change</h1>
        <form onSubmit={submitPasswordChange}>
          <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
            <div className="flexbox" style={{ padding: '8px 0' }}>
              <div style={{ fontSize: '1.2em', flex: '1 1 50%' }}>New Password</div>
              <div className="flexbox flex-col flex-center" style={{ flex: '1 1 50%' }}>
                <TextInput type="password" style={{ width: 'calc(100% - 16px)' }} onChange={(evt) => setPassword(evt.target.value)} value={password} />
              </div>
            </div>
            <div className="flexbox" style={{ padding: '8px 0', borderTop: '1px solid #CCC' }}>
              <div style={{ fontSize: '1.2em', flex: '1 1 50%' }}>Re-Enter New Password</div>
              <div className="flexbox flex-col flex-center" style={{ flex: '1 1 50%' }}>
                <TextInput type="password" style={{ width: 'calc(100% - 16px)' }} onChange={(evt) => setPassword2(evt.target.value)} value={password2} />
              </div>
            </div>
            <div className="flexbox" style={{ padding: '8px 0', borderTop: '1px solid #CCC' }}>
              <Button type="submit" className="btn-accent" style={{ margin: '8px' }} disabled={!validateForm()}>Change Password</Button>
            </div>
          </div>
        </form>
      </>
    );
  }

  function ChangeIGNPage() {
    const [ign, setIgn] = useState(identity.user.user_metadata.ign);

    const submitPasswordChange = (evt) => {
      evt.preventDefault();
      identity.update({
        user_metadata: {
          ign,
        },
      })
        .then(() => {
          alert('In-Game Name Successfully Updated');
          setCurrentPage(0);
        });
    };

    function validateForm() {
      return ign.length > 0 && ign !== identity.user.user_metadata.ign;
    }

    return (
      <>
        <h1 style={{ marginTop: 0 }}>Password Change</h1>
        <form onSubmit={submitPasswordChange}>
          <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
            <div className="flexbox" style={{ padding: '8px 0' }}>
              <div style={{ fontSize: '1.2em', flex: '1 1 50%' }}>New IGN</div>
              <div className="flexbox flex-col flex-center" style={{ flex: '1 1 50%' }}>
                <TextInput type="text" style={{ width: 'calc(100% - 16px)' }} onChange={(evt) => setIgn(evt.target.value)} value={ign} />
              </div>
            </div>
            <div className="flexbox" style={{ padding: '8px 0', borderTop: '1px solid #CCC' }}>
              <Button type="submit" className="btn-accent" style={{ margin: '8px' }} disabled={!validateForm()}>Change In-Game Name</Button>
            </div>
          </div>
        </form>
      </>
    );
  }

  const renderPage = () => {
    if (currentPage === 0) {
      return renderUserInfo(identity.user);
    // eslint-disable-next-line no-else-return
    } else if (currentPage === 1) {
      return (<ChangePasswordPage />);
    } else if (currentPage === 2) {
      return (<ChangeIGNPage />);
    }
    return undefined;
  };

  return (
    <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
      <div style={{ marginTop: '8px', marginLeft: '8px' }}>
        <Link to="/home">
          <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
        </Link>
      </div>
      { identity.user === undefined ? undefined : renderPage() }
    </div>
  );
}
