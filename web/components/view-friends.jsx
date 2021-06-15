import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';
import { Button, TextInput } from './forms/form-components';

const friendDataStore = () => {
  const [friends, setFriends] = useState([]);

  const [lastUpdate, setLastUpdate] = useState(0);

  const getFriends = () => friends;

  const refreshFriends = (fetchAgent) => fetchAgent('/functions/friends-get', {
    method: 'POST',
    body: '{}',
  })
    .then((x) => x.json())
    .then((x) => {
      setFriends(x.friends);
      setLastUpdate(Date.now());
    });

  const addFriend = (userObject, fetchAgent) => fetchAgent('/functions/friends-add', {
    method: 'POST',
    body: JSON.stringify({
      email: userObject.email,
    }),
  })
    .then((x) => x.json())
    .then(() => {
      const newFriends = friends;
      newFriends.push(userObject);
      setFriends(newFriends);
    });

  const removeFriend = (email, fetchAgent) => fetchAgent('/functions/friends-remove', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
    .then((x) => x.json())
    .then(() => {
      setFriends(friends.filter((x) => x.email.toLowerCase() !== email.toLowerCase()));
    });

  const searchFriend = (email, fetchAgent) => fetchAgent('/functions/friends-search', {
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  })
    .then((x) => x.json());

  return {
    friends,
    lastUpdate,
    getFriends,
    refreshFriends,
    addFriend,
    removeFriend,
    searchFriend,
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
        <div style={{ float: 'right' }}>
          <Button className="btn-accent" onClick={() => setCurrentPage(1)}>Manage Friend List</Button>
        </div>
      </div>
      <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
        { friendDataStoreInstance.getFriends().map((x) => renderFriendRow(x.email, x.ign, <Button className="btn-accent">Go To House</Button>)) }
      </div>
    </>
  );

  const ViewManageFriends = (props) => {
    const [targetEmail, setTargetEmail] = useState('');
    const [searchResult, setSearchResult] = useState(undefined);
    const { friendContext } = props;

    function validateForm() {
      return targetEmail.length > 0;
    }

    function verifyEmail() {
      friendContext.searchFriend(targetEmail, identity.authorizedFetch)
        .then((resp) => setSearchResult(resp))
        .catch(() => {
          console.log('invalid email');
        });
    }

    function addFriend() {
      friendContext.addFriend(searchResult, identity.authorizedFetch)
        .then(() => {
          setSearchResult(undefined);
          setTargetEmail('');
          alert('successfully added friend');
        })
        .catch(() => {
          alert('Failed to add friend!');
        });
    }

    function removeFriend(email) {
      friendContext.removeFriend(email, identity.authorizedFetch)
        .then(() => {
          alert('Successfully removed friend');
        })
        .catch(() => {
          alert('Failed to remove friend!');
        });
    }

    function renderManageFriendRow(email, name) {
      return renderFriendRow(email, name, <Button className="btn-accent" onClick={() => removeFriend(email)}>Remove</Button>);
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
              <div><Button className="btn-accent" onClick={verifyEmail} disabled={!validateForm()}>Search</Button></div>
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
                <Button style={{ height: '100%', padding: '4px 16px' }} className="btn-primary" onClick={() => setSearchResult(undefined)}>Cancel</Button>
              </div>
              <div><Button style={{ height: '100%', padding: '4px 16px' }} className="btn-accent" onClick={addFriend}>Add</Button></div>
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
