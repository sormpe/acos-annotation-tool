import { FunctionalComponent, h } from 'preact';
import { Route, Router, RouterOnChangeArgs, route } from 'preact-router';

import Home from '../routes/home';
import About from '../routes/about';
import Profile from '../routes/profile';
import NotFoundPage from '../routes/notfound';
import Header from './header';

const App: FunctionalComponent = () => {
  let currentUrl: string;
  const handleRoute = (e: RouterOnChangeArgs) => {
    currentUrl = e.url;
  };

  return (
    <div id="app">
      <Header />
      <Router onChange={handleRoute}>
        <Route path="/code-annotation-tool/" component={Home} />
        <Route path="/code-annotation-tool/about" component={About} />

        <Route path="profile/" component={Profile} user="me" />
        <Route path="/profile/:user" component={Profile} />
        <NotFoundPage default />
      </Router>
    </div>
  );
};

export default App;
