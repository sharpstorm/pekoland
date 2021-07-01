import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line object-curly-newline
import { BrowserRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import NetlifyIdentityContext from 'react-netlify-identity-auth';

function App() {
  return (
    <main>
      <h1>Admin Page</h1>
    </main>
  );
}

ReactDOM.render(
  <BrowserRouter>
    <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
      <App />
    </NetlifyIdentityContext>
  </BrowserRouter>,
  document.getElementById('app'),
);
