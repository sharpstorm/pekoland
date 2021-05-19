import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import FrontPageView from './components/view-frontpage';

function App() {
  return (
    <main>
      <Switch>
        <Route path={['/', '/register']} exact component={FrontPageView} />
        <Route component={Error} />
      </Switch>
    </main>
   );
}

ReactDOM.render(
  <BrowserRouter>
      <App />
  </BrowserRouter>, 
  document.getElementById('app')
);