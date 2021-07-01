import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { ArrowLeft } from '../components/icons';

export default function AdminReportsView() {
  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <Link to="/admin/home">
            <div style={{ float: 'left' }}><ArrowLeft color="#FFF" size="2rem" /></div>
          </Link>
        </div>
        <h1>Manage Reports</h1>
        <h2>Placeholder</h2>
      </div>
    </>
  );
}
