import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';

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
        Mail Page
      </div>
    </>
  );
}
