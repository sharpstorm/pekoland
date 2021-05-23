import React, { Fragment, useState, useEffect } from 'react';
import { Button } from './forms/form-components'
import { useIdentityContext } from 'react-netlify-identity-auth';
import { useHistory } from 'react-router-dom';

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

  return (
    <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
      <h1>Home</h1>
      <Button className='btn-primary'>Launch Game</Button>
      <Button className='btn-accent' style={{margin: '8px 0'}} onClick={logout}>Logout</Button>
    </div>
  );
}