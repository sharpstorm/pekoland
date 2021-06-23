import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';

export default function MailView() {
  const identity = useIdentityContext();
  const history = useHistory();

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    }
  }, [identity.ready]);

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <Link to="/home">
            <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
          </Link>
        </div>
        <h1>Mail Page</h1>
        <h2>Currently Unavailable</h2>
        <span>Check Again in Milestone 3</span>
      </div>
    </>
  );
}
