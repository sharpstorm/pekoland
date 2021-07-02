import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from '../components/icons';
import './admin.css';
import { Button } from '../components/forms/form-components';

const UserListStore = () => {
  const [users, setUsers] = useState(undefined);
  const [lastUpdate, setLastUpdate] = useState(-1);

  const getUsers = () => users;

  const refreshUsers = (fetchAgent) => fetchAgent('/functions/users-list', {
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
      if (x.users === undefined) {
        throw new Error('Failed to contact server');
      } else {
        setUsers(x.users);
        setLastUpdate(Date.now());
      }
    });

  const deleteUser = (targetId, fetchAgent) => fetchAgent('/functions/users-delete', {
    method: 'POST',
    body: JSON.stringify({ user_id: targetId }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      if (users !== undefined) {
        setUsers(users.filter((user) => user.id !== targetId));
      }
      setLastUpdate(Date.now());
    });

  const changeUserIGN = (targetId, ign, fetchAgent) => fetchAgent('/functions/users-ign-change', {
    method: 'POST',
    body: JSON.stringify({ user_id: targetId, ign }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      if (users !== undefined) {
        setUsers(users.map((user) => {
          if (user.id === targetId) {
            const newUser = user;
            newUser.ign = ign;
            return newUser;
          }
          return user;
        }));
      }
      setLastUpdate(Date.now());
    });

  return {
    lastUpdate,
    refreshUsers,
    deleteUser,
    getUsers,
    changeUserIGN,
  };
};

export default function AdminUsersView() {
  const userListStore = UserListStore();
  const identity = useIdentityContext();

  useEffect(() => {
    if (identity.ready && !identity.user) {
      window.location = '/';
    } else if (identity.ready) {
      userListStore.refreshUsers(identity.authorizedFetch);
    }
  }, [identity.ready]);

  const userListElement = (userListStore.getUsers() === undefined)
    ? (<h2>Loading Users List</h2>)
    : (
      <ul id="admin-user-list">
        <li key="header">
          <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Email</div>
          <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>In-Game Name</div>
          <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Is Admin</div>
          <div />
        </li>
        {userListStore.getUsers().map((user) => (
          <li key={user.id}>
            <div>{user.email}</div>
            <div>{user.ign}</div>
            <div>{user.isAdmin ? 'Yes' : 'No'}</div>
            <div style={{ display: 'flex' }}>
              <Button
                className="btn-accent"
                onClick={() => {
                  const newName = prompt('Enter new IGN');
                  userListStore.changeUserIGN(user.id, newName, identity.authorizedFetch);
                }}
              >
                Change IGN
              </Button>
              <Button
                className="btn-danger"
                style={{ marginLeft: '8px' }}
                disabled={user.isAdmin}
                onClick={() => {
                  // eslint-disable-next-line no-restricted-globals
                  if (confirm(`Confirm Delete ${user.email}?`)) {
                    userListStore.deleteUser(user.id, identity.authorizedFetch);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <Link to="/admin/home">
            <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
          </Link>
        </div>
        <h1>Manage Users</h1>
        {userListElement}
      </div>
    </>
  );
}
