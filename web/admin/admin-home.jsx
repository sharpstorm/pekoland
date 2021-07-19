import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { ArrowLeft } from '../components/icons';

export default function AdminHomeView() {
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
            <div className="flexbox flex-col flex-equal flex-center" style={{ textAlign: 'center' }}>
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
            <div className="flexbox flex-col flex-equal flex-center" style={{ textAlign: 'center', height: '100%' }}>
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
          <div style={{ flex: '0 0 0', borderRight: '1px solid #CCC', padding: '0 32px' }} className="flexbox flex-col flex-center">
            <div style={{ marginTop: '8px', marginLeft: '8px' }}>
              <a href="/home">
                <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
              </a>
            </div>
          </div>
          <div className="flex-equal">
            <h1>Administrator Controls</h1>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="flexbox" style={{ marginTop: '16px' }}>
          {makeTile('/admin/users', require('../assets/icon-people.svg'), 'Manage Users')}
          {makeTile('/admin/reports', require('../assets/icon-report.svg'), 'See Reports')}
        </div>
      </div>
    </>
  );
}
