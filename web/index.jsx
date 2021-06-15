import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line object-curly-newline
import { BrowserRouter, Route, Redirect, useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import NetlifyIdentityContext, { useIdentityContext } from 'react-netlify-identity-auth';

import FrontPageView from './components/view-frontpage';
import HomeView from './components/view-home';
import { RouteAnimatorSwitch } from './components/animator/animator-switch';
import { AnimCrossFade } from './components/animator/animations';
import LaunchGameView from './components/view-launch-game';
import SettingsView from './components/view-settings';
import FriendsView from './components/view-friends';
import MailView from './components/view-mail';
import ReportView from './components/view-report';

function App() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [fastForward, setFastForward] = useState(false);

  useEffect(() => {
    if (identity.ready && identity.user && history.location.pathname.startsWith('/login')) {
      setFastForward(true);
      history.replace('/home');
    }
  }, [identity.ready]);

  return (
    <main>
      <Route exact path="/" render={() => <Redirect to={`/login${(document.location.hash !== '') ? `#${document.location.hash}` : ''}`} />} />
      <RouteAnimatorSwitch animator={AnimCrossFade} path="/:p" fastForward={fastForward} onChange={() => setFastForward(false)}>
        <Route exact path="/login(/register|/forget|/reset|/confirm)?" component={FrontPageView} />
        <Route exact path="/home" component={HomeView} />
        <Route exact path="/settings" component={SettingsView} />
        <Route exact path="/friends" component={FriendsView} />
        <Route exact path="/mail" component={MailView} />
        <Route exact path="/report" component={ReportView} />
        <Route exact path="/launchgame" component={LaunchGameView} />
        <Redirect from="*" to="/" />
      </RouteAnimatorSwitch>
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
