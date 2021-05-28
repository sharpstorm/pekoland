import React, { Fragment, useState, useEffect } from 'react';
import { TextInput, Button } from './forms/form-components';
import { useIdentityContext } from 'react-netlify-identity-auth';
import { useHistory, Link } from 'react-router-dom';
import { ArrowLeft } from './icons';

// Send Message Headers
const SENDOP_CONFIG_CHANGED = 'pekoconn-config-changed';

// Recv Message Headers
const RECVOP_CONFIG_REQUEST = 'pekoconn-config-request';
const RECVOP_UPDATE_PEERID = 'pekoconn-update-peerid';

export default function LaunchGameView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [launchState, setLaunchState] = useState(0);
  const [mode, setMode] = useState(0);
  const [partnerString, setPartnerString] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState(undefined);
  const [windowId, setWindowId] = useState(undefined);
  const [peerEmail, setPeerEmail] = useState('');
  const [connectionError, setConnectionError] = useState('');

  function launchGame() {
    let wid = Date.now().toString();
    setWindowId(wid);
    window.open('game/index.html#' + wid, '_blank');
  }

  function selectMode(isHost) {
    setMode(isHost ? 1 : 2);
    setLaunchState(isHost ? 3 : 1);
    if (isHost) {
      launchGame();
    }
  }

  function attemptConnect() {
    setLaunchState(2);
    identity.authorizedFetch('/functions/host-id-get', {
      method: 'POST',
      body: JSON.stringify({
        email: peerEmail
      })
    })
    .then(res => res.json())
    .then(res => {
      if (!res.online) {
        setConnectionError('User is not Online!');
        setLaunchState(1);
      } else {
        setPartnerString(res.peer_id);
        setLaunchState(3);
        launchGame();
      }
    })
    .catch(e => {
      setConnectionError('Could not find user. Try Again.');
      setLaunchState(1);
    });
  }

  function emailValid() {
    return peerEmail.length > 0;
  }

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
      return;
    }
  }, [identity.ready]);

  useEffect(() => {
    if (identity.ready) {
      if (broadcastChannel === undefined) {
        let channel = new BroadcastChannel('pekoland-data');
        channel.onmessage = (evt) => {
          if (!evt.data || !evt.data.op) return;
          let data = evt.data;
  
          if (data.op === RECVOP_CONFIG_REQUEST) {
            channel.postMessage({
              op: SENDOP_CONFIG_CHANGED,
              channel: windowId,
              opMode: mode,
              name: identity.user.user_metadata.ign,
              partnerString: partnerString
            });
          } else if (data.op === RECVOP_UPDATE_PEERID) {
            identity.authorizedFetch('/functions/host-id-write', {
              method: 'POST',
              body: JSON.stringify({
                peer_id: data.peerId
              })
            });
          }
        }
        setBroadcastChannel(channel);
        console.log('Opened Broadcast Channel');
      }
    }

    return () => {
      if (broadcastChannel !== undefined) {
        broadcastChannel.close();
        setBroadcastChannel(undefined);
        console.log('Closed Broadcast Channel');
      }
    }
  });

  return (
    <div className='panel panel-sm panel-dark flexbox flex-col' style={{textAlign: 'center', paddingBottom: '16px'}}>
      <div style={{marginTop: '8px', marginLeft: '8px'}}>
        <Link to='/home'>
          <div style={{float: 'left'}}><ArrowLeft color='#FFF' size='2rem'/></div>
        </Link>
      </div>

      {(launchState === 0) ? (
        <div className='flexbox flex-mobile-col' style={{height: '250px'}}>
          <Button onClick={() => selectMode(true)} className='btn-primary btn-primary-dark' style={{marginTop: '8px', flex: '1 1 0'}}>Host A Room</Button>
          <span className='flexbox flex-col flex-center' style={{margin: '16px', fontSize: '2em'}}>OR</span>
          <Button onClick={() => selectMode(false)} className='btn-accent' style={{marginTop: '8px', flex: '1 1 0'}}>Join A Friend</Button>
        </div>
      ) : (launchState === 1 || launchState === 2) ? (
        <div>
          <h2>Enter the Email Address of Your Friend</h2>
          <TextInput type='email' placeholder='Email' style={{flex: '1 1 0', width: '100%', boxSizing: 'border-box'}} onChange={(evt) => setPeerEmail(evt.target.checkValidity() ? evt.target.value : '')} value={peerEmail} disabled={!(launchState === 1)} />
          <span style={{display: connectionError === '' ? 'none' : 'block'}}>{connectionError}</span>
          <Button onClick={attemptConnect} className={'btn-accent' + ((launchState === 1) ? '' : ' loading')} style={{marginTop: '8px', flex: '1 1 0'}} disabled={!(launchState === 1) || !emailValid()}>Join</Button>
        </div>
      ) : (
        <div>
          <h2>Game is Launching In New Window</h2>
          <span>Please Allow Pop-ups!</span>
          <Button onClick={launchGame} className='btn-accent' style={{marginTop: '8px'}}>Or Click Here To Launch Manually</Button>
        </div>
      )}
      
    </div>
  );
}