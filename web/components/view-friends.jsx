import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';
import { Button, TextInput } from './forms/form-components';

const friendDataStore = () => {
  const [friends, setFriends] = useState([]);

  const [lastUpdate, setLastUpdate] = useState(0);

  const getFriends = () => friends.filter((x) => !x.waiting || x.waiting === 0);
  const getFriendRequests = () => friends.filter((x) => x.waiting && x.waiting > 0);

  const refreshFriends = (fetchAgent) => fetchAgent('/functions/friends-get', {
    method: 'POST',
    body: '{}',
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((x) => {
      if (x.friends === undefined) {
        throw new Error('Failed to contact server');
      } else {
        setFriends(x.friends);
        setLastUpdate(Date.now());
      }
    });

  const addFriend = (userObject, fetchAgent) => fetchAgent('/functions/friends-add', {
    method: 'POST',
    body: JSON.stringify({
      email: userObject.email,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((resp) => {
      if (!resp.pending) {
        const newFriends = friends;
        newFriends.push(userObject);
        setFriends(newFriends);
      }
    });

  const removeFriend = (email, fetchAgent) => fetchAgent('/functions/friends-remove', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      setFriends(friends.filter((x) => x.email.toLowerCase() !== email.toLowerCase()));
    });

  const searchFriend = (email, fetchAgent) => fetchAgent('/functions/friends-search', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    });

  const acceptFriend = (email, fetchAgent) => fetchAgent('/functions/friends-confirm', {
    method: 'POST',
    body: JSON.stringify({
      email,
      accept: true,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      if (friends) {
        setFriends(friends.map((x) => {
          if (x.email === email) {
            const newX = x;
            newX.waiting = 0;
            return newX;
          }
          return x;
        }));
      }
    });

  const rejectFriend = (email, fetchAgent) => fetchAgent('/functions/friends-confirm', {
    method: 'POST',
    body: JSON.stringify({
      email,
      accept: false,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      if (friends) {
        setFriends(friends.filter((x) => x.email !== email));
      }
    });

  return {
    friends,
    lastUpdate,
    getFriends,
    getFriendRequests,
    refreshFriends,
    addFriend,
    removeFriend,
    searchFriend,
    acceptFriend,
    rejectFriend,
  };
};

export default function FriendsView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(0);
  const friendDataStoreInstance = friendDataStore();

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready) {
      friendDataStoreInstance.refreshFriends(identity.authorizedFetch);
    }
  }, [identity.ready]);

  function triggerGameStart(email) {
    history.push('/launchgame', {
      isHost: false,
      target: email,
    });
  }

  function renderFriendRow(email, name, buttons) {
    return (
      <div className="flexbox" style={{ padding: '16px 0', borderTop: '1px solid #CCC' }} key={email}>
        <div className="flexbox flex-col flex-center flex-equal">{name}</div>
        <div className="flexbox flex-col flex-center flex-equal">{email}</div>
        <div className="flexbox flex-col flex-center">
          {buttons}
        </div>
      </div>
    );
  }

  const ViewFriendList = () => (
    <>
      <h1 style={{ margin: 0 }}>Your Friends</h1>
      <div>
        <div style={{ float: 'right', display: 'flex' }}>
          <Button className="btn-accent" onClick={() => setCurrentPage(2)} style={{ marginRight: '8px', display: (friendDataStoreInstance.getFriendRequests().length > 0) ? '' : 'none' }}>View Friend Requests</Button>
          <Button className="btn-accent" onClick={() => setCurrentPage(1)}>Manage Friend List</Button>
        </div>
      </div>
      <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
        { friendDataStoreInstance.getFriends().map((x) => renderFriendRow(x.email, x.ign, <Button onClick={() => triggerGameStart(x.email)} className="btn-accent">Go To House</Button>)) }
      </div>
    </>
  );

  const ViewFriendRequests = () => {
    const [formState, setFormState] = useState(0);
    return (
      <>
        <h1 style={{ margin: 0 }}>Your Friend Requests</h1>
        <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
          {
            friendDataStoreInstance.getFriendRequests()
              .map((x) => renderFriendRow(x.email, x.ign,
                (
                  <div className="flexbox">
                    <Button
                      style={{ marginRight: '8px' }}
                      disabled={formState !== 0}
                      onClick={() => {
                        setFormState(1);
                        friendDataStoreInstance.acceptFriend(x.email, identity.authorizedFetch)
                          .then(() => {
                            setFormState(0);
                            alert('Successfully Accepted Friend');
                          })
                          .catch(() => {
                            setFormState(0);
                            alert('Failed to Accept Friend');
                          });
                      }}
                      className={`btn-accent${formState !== 0 ? ' loading' : ''}`}
                    >
                      Accept
                    </Button>
                    <Button
                      disabled={formState !== 0}
                      onClick={() => {
                        setFormState(1);
                        friendDataStoreInstance.rejectFriend(x.email, identity.authorizedFetch)
                          .then(() => {
                            setFormState(0);
                            alert('Successfully Deleted Friend Request');
                          })
                          .catch(() => {
                            setFormState(0);
                            alert('Failed to Delete Friend Request');
                          });
                      }}
                      className={`btn-danger${formState !== 0 ? ' loading' : ''}`}
                    >
                      Reject
                    </Button>
                  </div>
                )))
          }
        </div>
      </>
    );
  };

  const ViewManageFriends = (props) => {
    const [targetEmail, setTargetEmail] = useState('');
    const [searchResult, setSearchResult] = useState(undefined);
    const [formState, setFormState] = useState(0);
    // State 0: Wait User Input, State 1: Searching, State 2: Adding new Friend, State 3: Removing
    const { friendContext } = props;

    function validateForm() {
      return targetEmail.length > 0;
    }

    function verifyEmail() {
      setFormState(1);
      friendContext.searchFriend(targetEmail, identity.authorizedFetch)
        .then((resp) => {
          setSearchResult(resp);
        })
        .catch(() => {
          alert('Invalid Email');
        })
        .finally(() => setFormState(0));
    }

    function addFriend() {
      setFormState(2);
      friendContext.addFriend(searchResult, identity.authorizedFetch)
        .then(() => {
          setSearchResult(undefined);
          setTargetEmail('');
          alert('successfully sent friend request');
        })
        .catch(() => {
          alert('Failed to add friend!');
        })
        .finally(() => setFormState(0));
    }

    function removeFriend(email) {
      setFormState(3);
      friendContext.removeFriend(email, identity.authorizedFetch)
        .then(() => {
          alert('Successfully removed friend');
        })
        .catch(() => {
          alert('Failed to remove friend!');
        })
        .finally(() => setFormState(0));
    }

    function renderManageFriendRow(email, name) {
      return renderFriendRow(email, name, <Button className={`btn-accent${formState === 3 ? ' loading' : ''}`} onClick={() => removeFriend(email)} disabled={formState !== 0}>Remove</Button>);
    }

    return (
      <>
        <h1 style={{ margin: 0 }}>Your Friends</h1>
        <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
          { friendContext.getFriends().map((x) => renderManageFriendRow(x.email, x.ign)) }
        </div>
        <h2 style={{ margin: '8px 0' }}>Add New Friend</h2>
        {searchResult === undefined ? (
          <div className="flexbox" style={{ borderTop: '1px solid #CCC', paddingTop: '8px' }}>
            <div className="flexbox flex-equal" style={{ flexWrap: 'wrap' }}>
              <div className="flexbox flex-col flex-center">Registered Email:</div>
              <TextInput
                type="email"
                placeholder="Email"
                style={{ margin: '0 16px', flex: '1 1 0' }}
                onChange={(evt) => setTargetEmail(evt.target.checkValidity() ? evt.target.value : '')}
                value={targetEmail}
              />
              <div><Button className={`btn-accent${formState === 1 ? ' loading' : ''}`} onClick={verifyEmail} disabled={!validateForm() || formState !== 0}>Search</Button></div>
            </div>
          </div>
        ) : (
          <div className="flexbox" style={{ borderTop: '1px solid #CCC', paddingTop: '8px' }}>
            <div className="flexbox flex-equal" style={{ flexWrap: 'wrap' }}>
              <div className="flexbox flex-col flex-equal">
                <div className="flexbox">
                  <div className="flexbox flex-col flex-center flex-equal">Registered Email:</div>
                  <div className="flexbox flex-col flex-center flex-equal" style={{ textAlign: 'left' }}>{searchResult.email}</div>
                </div>
                <div className="flexbox" style={{ margin: '8px 0' }}>
                  <div className="flexbox flex-col flex-center flex-equal">In-Game Name:</div>
                  <div className="flexbox flex-col flex-center flex-equal" style={{ textAlign: 'left' }}>{searchResult.ign}</div>
                </div>
              </div>
              <div style={{ marginRight: '8px' }}>
                <Button style={{ height: '100%', padding: '4px 16px' }} className="btn-primary" disabled={formState !== 0} onClick={() => { setSearchResult(undefined); setFormState(0); }}>Cancel</Button>
              </div>
              <div><Button style={{ height: '100%', padding: '4px 16px' }} className={`btn-accent${formState === 2 ? ' loading' : ''}`} onClick={addFriend}>Add</Button></div>
            </div>
          </div>
        )}
      </>
    );
  };

  let view;
  if (currentPage === 0) {
    view = <ViewFriendList friendContext={friendDataStoreInstance} />;
  } else if (currentPage === 1) {
    view = <ViewManageFriends friendContext={friendDataStoreInstance} />;
  } else if (currentPage === 2) {
    view = <ViewFriendRequests friendContext={friendDataStoreInstance} />;
  }

  const back = () => {
    if (currentPage === 0) {
      history.replace('/home');
    } else {
      setCurrentPage(0);
    }
  };

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <button type="button" className="btn-invisible" style={{ float: 'left' }} onClick={back}>
            <ArrowLeft color="#FFF" size="2rem" />
          </button>
        </div>
        {view}
      </div>
    </>
  );
}
