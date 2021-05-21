import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import FrontPageView from './components/view-frontpage';
import HomeView from './components/view-home';
import NetlifyIdentityContext from 'react-netlify-identity-gotrue';

function App() {
  return (
    <main>
      <Switch>
        <Route path={['/', '/register']} exact component={FrontPageView} />
        <Route path='/home' exact component={HomeView} />
        <Route component={Error} />
      </Switch>
    </main>
   );
}

ReactDOM.render(
  <BrowserRouter>
    <NetlifyIdentityContext url={'https://orbital-2021-pekoland.netlify.app'}>
      <App />
    </NetlifyIdentityContext>
  </BrowserRouter>, 
  document.getElementById('app')
);