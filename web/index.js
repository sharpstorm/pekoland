import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import FrontPageView from './components/view-frontpage';
import HomeView from './components/view-home';
import { default as NetlifyIdentityContext, useIdentityContext } from 'react-netlify-identity-gotrue';
import { RouteAnimatorSwitch } from './components/animator/animator-switch';
import { AnimCrossFade } from './components/animator/animations';

function App() {
  const identity = useIdentityContext();

  return (
    <main>
      <Route exact path='/' render={() => <Redirect to='/login'/>} />
      <RouteAnimatorSwitch animator={AnimCrossFade} path='/:p'>
        <Route exact path={'/login/(register)?'} component={FrontPageView}/>
        <Route exact path='/home' component={HomeView} />
        <Route component={Error} />
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