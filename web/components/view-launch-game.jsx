import React, { useState, useEffect } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { Button } from './forms/form-components';
import { ArrowLeft } from './icons';

// Send Message Headers
const SENDOP_CONFIG_CHANGED = 'pekoconn-config-changed';
const SENDOP_GAME_OP = 'pekoconn-game-reply';

// Recv Message Headers
const RECVOP_CONFIG_REQUEST = 'pekoconn-config-request';
const RECVOP_UPDATE_PEERID = 'pekoconn-update-peerid';
const RECVOP_GAME_OP = 'pekoconn-game-op';

export default function LaunchGameView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const location = useLocation();
  const [launchState, setLaunchState] = useState(0);
  const [mode, setMode] = useState(0);
  const [partnerString, setPartnerString] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState(undefined);
  const [windowId, setWindowId] = useState(undefined);
  const [furnitureState, setFurnitureState] = useState(undefined);
  const [awaitingFurniture, setAwaitingFurniture] = useState(false);
  const [echoFurnitureUpdate, setEchoFurnitureUpdate] = useState(undefined);
  const [connectionError, setConnectionError] = useState('');

  function launchGame() {
    const wid = Date.now().toString();
    setWindowId(wid);
  }

  function selectMode(isHost) {
    setMode(isHost ? 1 : 2);
    setLaunchState(isHost ? 3 : 1);
    if (isHost) {
      launchGame();
    }
  }

  function attemptConnect(email) {
    setLaunchState(2);
    identity.authorizedFetch('/functions/host-id-get', {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.online) {
          setConnectionError('User is not Online!');
          setLaunchState(1);
        } else {
          setPartnerString(res.peer_id);
          setLaunchState(3);
          launchGame();
        }
      })
      .catch(() => {
        setConnectionError('Could not find user. Try Again.');
        setLaunchState(1);
      });
  }

  function hookChannelHandler(channel) {
    // eslint-disable-next-line no-param-reassign
    channel.onmessage = (evt) => {
      if (!evt.data || !evt.data.op) return;
      const { data } = evt;

      if (data.op === RECVOP_CONFIG_REQUEST) {
        channel.postMessage({
          op: SENDOP_CONFIG_CHANGED,
          channel: windowId,
          opMode: mode,
          userId: identity.user.id,
          name: identity.user.user_metadata.ign,
          partnerString,
        });
      } else if (data.op === RECVOP_UPDATE_PEERID) {
        setAwaitingFurniture(true);
        identity.authorizedFetch('/functions/host-id-write', {
          method: 'POST',
          body: JSON.stringify({
            peer_id: data.peerId,
          }),
        })
          .then((x) => x.json())
          .then((x) => {
            setFurnitureState(x.furniture);
            setAwaitingFurniture(false);
          });
      } else if (data.op === RECVOP_GAME_OP) {
        if (data.payload.op === 'furniture-get') {
          setEchoFurnitureUpdate(channel);
        } else {
          if (data.payload.op === 'furniture-save') {
            setFurnitureState(data.payload.data);
          }
          identity.authorizedFetch('/functions/game-op', {
            method: 'POST',
            body: JSON.stringify(data.payload),
          })
            .then((x) => x.json())
            .then((x) => {
              channel.postMessage({
                op: SENDOP_GAME_OP,
                channel: windowId,
                reply: x,
              });
            });
        }
      }
    };
  }

  useEffect(() => {
    if (!awaitingFurniture && echoFurnitureUpdate) {
      echoFurnitureUpdate.postMessage({
        op: SENDOP_GAME_OP,
        channel: windowId,
        reply: {
          message: 'OK',
          data: furnitureState,
        },
      });
    }
  }, [awaitingFurniture, echoFurnitureUpdate, furnitureState]);

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready && (location.state === undefined
        || location.state.isHost === undefined
        || location.state.target === undefined)) {
      console.log('No State');
      history.replace('/home');
    } else if (identity.ready) {
      selectMode(location.state.isHost);
      if (location.state.isHost) {
        launchGame();
      } else {
        attemptConnect(location.state.target);
      }
    }
  }, [identity.ready]);

  useEffect(() => {
    if (identity.ready) {
      if (broadcastChannel !== undefined) {
        hookChannelHandler(broadcastChannel);
      }

      if (windowId !== undefined && windowId !== '') {
        window.open(`game/index.html#${windowId}`, '_blank');
      }
    }
  }, [windowId]);

  useEffect(() => {
    if (broadcastChannel === undefined && identity.ready) {
      const channel = new BroadcastChannel('pekoland-data');
      hookChannelHandler(channel);
      setBroadcastChannel(channel);
      console.log('Opened Broadcast Channel');
      return () => {
        channel.close();
        setBroadcastChannel(undefined);
        console.log('Closed Broadcast Channel');
      };
    }
    return undefined;
  }, [identity.ready]);

  let page;
  if (launchState === 0) {
    page = (
      <div>
        <h1>An error has occurred</h1>
      </div>
    );
  } else if (launchState === 1 || launchState === 2) {
    page = (
      <div>
        {connectionError === '' ? (
          <h1>Connecting...</h1>
        ) : (
          <>
            <h1>Failed to Connect</h1>
            <h2>{connectionError}</h2>
          </>
        )}
      </div>
    );
  } else {
    page = (
      <div>
        <h2>Game is Launching In New Window</h2>
        <span>Please Allow Pop-ups!</span>
        <Button onClick={launchGame} className="btn-accent" style={{ marginTop: '8px' }}>Or Click Here To Launch Manually</Button>
      </div>
    );
  }

  return (
    <div className="panel panel-sm panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
      <div style={{ marginTop: '8px', marginLeft: '8px' }}>
        <Link to="/home">
          <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
        </Link>
      </div>
      {page}
    </div>
  );
}
