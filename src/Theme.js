import React from 'react'
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'

const baseTheme = createTheme(adaptV4Theme({
  spacing: 8,
  maxContentWidth: '1440px',
  typography: {
    h1: {
      fontWeight: 'bold',
      fontSize: '2.5em',
      color: '#424242'
    },
    h2: {
      fontWeight: 'bold',
      fontSize: '1.7em',
      color: '#1b1b1b'
    },
    h3: {
      fontSize: '1.4em',
      color: '#1b1b1b'
    },
    h4: {
      fontSize: '1.25em'
    },
    h5: {
      fontSize: '1.1em'
    },
    h6: {
      fontSize: '1em'
    }
  },
  palette: {
    primary: {
      main: '#424242'
    },
    secondary: {
      main: '#FC433F'
    }
  },
  overrides: {}
}))

const extendedTheme = theme => ({
  ...theme,
  typography: {
    ...theme.typography,
    h1: {
      ...theme.typography.h1,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.8em'
      }
    },
    h2: {
      ...theme.typography.h2,
      [theme.breakpoints.down('md')]: {
        fontSize: '1.6em'
      }
    }
  },
  templates: {
    page_wrap: {
      maxWidth: `min(${theme.maxContentWidth}, 100vw)`,
      margin: 'auto',
      boxSizing: 'border-box',
      padding: theme.spacing(7),
      [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(5)
      }
    },
    subheading: {
      textTransform: 'uppercase',
      letterSpacing: '6px',
      fontWeight: '700'
    }
  }
})

const Theme = withStyles({
  '@global html': {
    padding: '0px',
    margin: '0px'
  },
  '@global body': {
    padding: '0px',
    margin: '0px',
    fontFamily: 'helvetica'
  },
  '@global a': {
    textDecoration: 'none',
    color: '#424242'
  },
  '@global h1': {
    fontWeight: 'bold',
    fontSize: '2.5em',
    color: '#424242'
  },
  '@global h2': {
    fontWeight: 'bold',
    fontSize: '1.7em',
    color: '#1b1b1b'
  },
  '@global h3': {
    fontSize: '1.4em',
    color: '#1b1b1b'
  },
  '@global h4': {
    fontSize: '1.25em'
  },
  '@global h5': {
    fontSize: '1.1em'
  },
  '@global h6': {
    fontSize: '1em'
  }
})(({ children }) => (
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={baseTheme}>
      <ThemeProvider theme={extendedTheme}>
        {children}
      </ThemeProvider>
    </ThemeProvider>
  </StyledEngineProvider>
))

export default Theme