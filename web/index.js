import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect, useHistory } from 'react-router-dom';
import FrontPageView from './components/view-frontpage';
import HomeView from './components/view-home';
import NetlifyIdentityContext, { useIdentityContext } from 'react-netlify-identity-auth';
import { RouteAnimatorSwitch } from './components/animator/animator-switch';
import { AnimCrossFade } from './components/animator/animations';

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
      <Route exact path='/' render={() => <Redirect to='/login'/>} />
      <RouteAnimatorSwitch animator={AnimCrossFade} path='/:p' fastForward={fastForward} onChange={() => setFastForward(false)}>
        <Route exact path={'/login(/register)?'} component={FrontPageView}/>
        <Route exact path='/home' component={HomeView} />
        <Redirect from='*' to='/' />
      </RouteAnimatorSwitch>
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