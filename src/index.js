import React from 'react'
import ReactDOM from 'react-dom'
import Prompt from '@babbage/react-prompt'
import App from './App'

ReactDOM.render(
  <Prompt
    appName='Stuff'
    appIcon='/favicon.ico'
    description='Babbage Filesystem Explorer'
    author='Ty J Everett'
    authorUrl='https://tyeverett.com'
  >
    <App />
  </Prompt>,
  document.getElementById('root')
)
