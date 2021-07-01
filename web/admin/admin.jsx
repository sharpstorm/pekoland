import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line object-curly-newline
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import NetlifyIdentityContext, { useIdentityContext } from 'react-netlify-identity-auth';
import { RouteAnimatorSwitch } from '../components/animator/animator-switch';
import { AnimCrossFade } from '../components/animator/animations';
import AdminHomeView from './admin-home';
import AdminUsersView from './admin-users';
import AdminReportsView from './admin-reports';

function AdminApp() {
  const identity = useIdentityContext();
  const [fastForward, setFastForward] = useState(false);

  // Should be enforced at router level, but if they somehow get here kick them out
  useEffect(() => {
    if (identity.ready) {
      if (!identity.user) {
        window.location = '/';
        return;
      }
      if (!identity.user.app_metadata || !identity.user.app_metadata.roles || !identity.user.app_metadata.roles.includes('admin')) {
        window.location = '/';
      }
    }
    setFastForward(false);
  }, [identity.ready]);

  return (
    <main>
      <RouteAnimatorSwitch animator={AnimCrossFade} path="/admin/:p" fastForward={fastForward}>
        <Route exact path="/admin/home" component={AdminHomeView} />
        <Route exact path="/admin/users" component={AdminUsersView} />
        <Route exact path="/admin/reports" component={AdminReportsView} />
      </RouteAnimatorSwitch>
      <Redirect exact from="/admin" to="/admin/home" />
    </main>
  );
}

ReactDOM.render(
  <BrowserRouter>
    <NetlifyIdentityContext url="https://orbital-2021-pekoland.netlify.app">
      <AdminApp />
    </NetlifyIdentityContext>
  </BrowserRouter>,
  document.getElementById('app'),
);
