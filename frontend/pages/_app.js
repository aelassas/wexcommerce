import { useEffect, useState } from 'react'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Router from 'next/router'
import NProgress from 'nprogress'
import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import * as SettingService from '../services/SettingService'

import 'nprogress/nprogress.css'
import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

const App = ({ Component, pageProps }) => {
  const [theme, setTheme] = useState()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })

    const start = () => {
      NProgress.start()
    }
    const end = () => {
      NProgress.done()
    }
    Router.events.on('routeChangeStart', start)
    Router.events.on('routeChangeComplete', end)
    Router.events.on('routeChangeError', end)
    return () => {
      Router.events.off('routeChangeStart', start)
      Router.events.off('routeChangeComplete', end)
      Router.events.off('routeChangeError', end)
    }
  }, [])

  useEffect(() => {
    (async function () {
      const lang = await SettingService.getLanguage()
      const isFr = lang === 'fr'
      const theme = createTheme({
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            "'Segoe UI'",
            'Roboto',
            "'Helvetica Neue'",
            'Arial',
            'sans-serif',
            "'Apple Color Emoji'",
            "'Segoe UI Emoji'",
            "'Segoe UI Symbol'",
          ].join(','),
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#fafafa',
              }
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                '&.Mui-disabled': {
                  opacity: 0.5
                }
              }
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                '&.Mui-disabled': {
                  opacity: 0.5
                }
              }
            },
          },
          MuiFormControl: {
            styleOverrides: {
              root: {
                '& .Mui-disabled': {
                  color: '#333 !important'
                }
              }
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                '& .Mui-checked': {
                  color: '#121212 !important'
                },
                '& .Mui-checked+.MuiSwitch-track': {
                  opacity: 0.7,
                  backgroundColor: '#121212 !important'
                }
              }
            },
          },
          MuiAutocomplete: {
            styleOverrides: {
              root: {
                '& .MuiAutocomplete-inputRoot': {
                  paddingRight: '20px !important'
                }
              },
              listbox: {
                '& .Mui-focused': {
                  backgroundColor: '#eee !important',
                }
              },
              option: {
                '&[aria-selected="true"]': {
                  backgroundColor: '#faad43 !important'
                },
              },
            },
          },
        },
      }
        , isFr ? frFR : enUS
        , isFr ? corefrFR : coreenUS)

      setTheme(theme)
    })()
  }, [])

  if (!theme) {
    return null
  }

  return (
    <>
      <Head>
        <title>wexCommerce</title>
        <meta charset='utf-8' />
        <meta name='description' content='wexCommerce' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <Component {...pageProps} />
          <ToastContainer
            position='bottom-left'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={true}
            icon={true}
            theme='dark'
          />
        </CssBaseline>
      </ThemeProvider>
    </>
  )
}

export default App