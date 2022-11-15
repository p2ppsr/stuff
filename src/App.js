import React from 'react'
import Files from './Files'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
      <Router>
        <Switch>
          <Route path='/' component={Files} />
        </Switch>
      </Router>
      <ToastContainer />
    </div>
  )
}

export default App
