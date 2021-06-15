import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { Button } from './forms/form-components';

export default function HomeView() {
  const identity = useIdentityContext();
  const history = useHistory();

  function logout() {
    identity.logout();
    history.replace('/login');
  }

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    }
  }, [identity.ready]);

  function makeTile(link, imageAsset, text) {
    const icon = (
      <img
        src={imageAsset}
        alt={text}
        style={{
          margin: '8px',
          padding: '8px',
          maxWidth: '150px',
          maxHeight: '150px',
          width: '50%',
        }}
      />
    );

    if (typeof link === 'string') {
      return (
        <div className="panel panel-sm panel-dark" style={{ textAlign: 'center', margin: '8px' }}>
          <Link
            to={link}
            className="flexbox"
            style={{
              width: '100%',
              height: '100%',
              color: '#FFF',
              textDecoration: 'none',
            }}
          >
            {icon}
            <div className="flexbox flex-col flex-center" style={{ textAlign: 'center', flex: '1 1 0' }}>
              <h1>{text}</h1>
            </div>
          </Link>
        </div>
      );
    }
    if (typeof link === 'function') {
      return (
        <div className="panel panel-sm panel-dark" style={{ textAlign: 'center', margin: '8px' }}>
          <button
            onClick={link}
            type="button"
            className="flexbox btn-invisible"
            style={{
              width: '100%',
              height: '100%',
              color: '#FFF',
              textDecoration: 'none',
            }}
          >
            {icon}
            <div className="flexbox flex-col flex-center" style={{ textAlign: 'center', flex: '1 1 0', height: '100%' }}>
              <h1>{text}</h1>
            </div>
          </button>
        </div>
      );
    }
    return undefined;
  }

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div className="flexbox">
          <div style={{ flex: '1 1 0' }}>
            <h1>
              {`Hello ${identity.user !== undefined ? identity.user.user_metadata.ign : ''}`}
            </h1>
            <span>What would you do today?</span>
          </div>
          <div style={{ flex: '0 0 0', borderLeft: '1px solid #CCC', padding: '16px 32px' }}>
            <Button className="btn-accent" style={{ margin: '8px 0' }} onClick={logout}>Logout</Button>
            <Link to="/settings">
              <Button className="btn-accent" style={{ margin: '8px 0' }}>Settings</Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flexbox" style={{ marginTop: '16px' }}>
          {makeTile('/friends', require('../assets/icon-people.svg'), 'Friends')}
          {makeTile('/mail', require('../assets/icon-mail.svg'), 'Mail')}
        </div>
        <div className="flexbox" style={{ marginTop: '16px' }}>
          {makeTile(() => {
            history.push('/launchgame', {
              isHost: true,
              target: '',
            });
          }, require('../assets/icon-launch.svg'), 'Start Game')}
          {makeTile('/report', require('../assets/icon-report.svg'), 'Contact Admins')}
        </div>
      </div>
    </>
  );
}
