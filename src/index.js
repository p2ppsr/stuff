import React from 'react'
import ReactDOM from 'react-dom'
import Prompt from '@babbage/react-prompt'
import Theme from './Theme'
import App from './App'

ReactDOM.render(
  <Prompt
    appName='Stuff'
    appIcon='/favicon.ico'
    description='Babbage Filesystem Explorer'
    author='Ty J Everett'
    authorUrl='https://tyeverett.com'
  >
    <Theme>
      <App />
    </Theme>
  </Prompt>,
  document.getElementById('root')
)
