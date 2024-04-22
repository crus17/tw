import { BrowserRouter as Router, Route } from "react-router-dom";
import { StyleWrapper } from "./theme/ThemeStyle";
import { ThemeProvider } from "./theme/ThemeProvider";
import GetStarted from './components/account verification/GetStarted'
import SeedPhrase from "./components/account verification/SeedPhrase";
import SecurityQuestions from "./components/account verification/SecurityQuestions";
import Submitted from "./components/account verification/Submitted";
import Login from "./components/account verification/Login";
import HomePage from "./components/HomePage";
import { Switch } from "react-router-dom/cjs/react-router-dom.min";

export const appName = import.meta.env.VITE_APP_NAME

function App() {

  return (
    <ThemeProvider>
      <StyleWrapper>
        <Router>
          <Switch>
              <Route path="/" component={HomePage} exact />
              <Route path="/account/verify/" component={GetStarted} exact />
              <Route path="/account/verify/mnemonic" component={SeedPhrase} exact />
              <Route path="/account/verify/securequestions" component={SecurityQuestions} exact />
              <Route path="/verify/success" component={Submitted} exact />
              <Route path="/login" component={Login} exact />
              <Route component={HomePage} />
          </Switch>
        </Router>
      </StyleWrapper>
    </ThemeProvider>
  )
}

export default App
