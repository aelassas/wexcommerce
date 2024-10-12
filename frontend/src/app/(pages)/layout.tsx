'use client'

import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { createTheme, Theme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { frFR as corefrFR, enUS as coreenUS } from '@mui/material/locale'
import { frFR, enUS } from '@mui/x-date-pickers/locales'
import * as SettingService from '@/lib/SettingService'
import { LanguageProvider } from '@/context/LanguageContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { UserProvider } from '@/context/UserContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import env from '@/config/env.config'
import * as helper from '@/common/helper'

import { strings as activateStrings } from '@/lang/activate'
import { strings as cartStrings } from '@/lang/cart'
import { strings as changePasswordStrings } from '@/lang/change-password'
import { strings as checkoutSessionStrings } from '@/lang/checkout-session'
import { strings as checkoutStrings } from '@/lang/checkout'
import { strings as commonStrings } from '@/lang/common'
import { strings as dashboardStrings } from '@/lang/dashboard'
import { strings as footerStrings } from '@/lang/footer'
import { strings as forgotPasswordStrings } from '@/lang/forgot-password'
import { strings as headerStrings } from '@/lang/header'
import { strings as homeStrings } from '@/lang/home'
import { strings as noMatchStrings } from '@/lang/no-match'
import { strings as notificationListStrings } from '@/lang/notification-list'
import { strings as orderDateFilterStrings } from '@/lang/order-date-filter'
import { strings as orderListStrings } from '@/lang/order-list'
import { strings as orderStatusStrings } from '@/lang/order-status'
import { strings as productStrings } from '@/lang/product'
import { strings as searchStrings } from '@/lang/search'
import { strings as settingsStrings } from '@/lang/settings'
import { strings as signInStrings } from '@/lang/sign-in'
import { strings as signUpStrings } from '@/lang/sign-up'
import { strings as soldOutStrings } from '@/lang/sold-out'
import { strings as wishlistStrings } from '@/lang/wishlist'

import 'react-toastify/dist/ReactToastify.min.css'
import '@/styles/globals.css'

import { init as initGA } from '@/common/ga4'

if (env.GOOGLE_ANALYTICS_ENABLED) {
  initGA()
}

type LayoutProps = Readonly<{
  children: React.ReactNode
}>

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>()

  useEffect(() => {
    const init = async () => {
      const language = await SettingService.getLanguage()
      const isFr = language === 'fr'

      helper.setLanguage(activateStrings, language)
      helper.setLanguage(cartStrings, language)
      helper.setLanguage(checkoutStrings, language)
      helper.setLanguage(changePasswordStrings, language)
      helper.setLanguage(checkoutSessionStrings, language)
      helper.setLanguage(commonStrings, language)
      helper.setLanguage(dashboardStrings, language)
      helper.setLanguage(footerStrings, language)
      helper.setLanguage(forgotPasswordStrings, language)
      helper.setLanguage(headerStrings, language)
      helper.setLanguage(homeStrings, language)
      helper.setLanguage(noMatchStrings, language)
      helper.setLanguage(notificationListStrings, language)
      helper.setLanguage(orderDateFilterStrings, language)
      helper.setLanguage(orderListStrings, language)
      helper.setLanguage(orderStatusStrings, language)
      helper.setLanguage(productStrings, language)
      helper.setLanguage(searchStrings, language)
      helper.setLanguage(settingsStrings, language)
      helper.setLanguage(signInStrings, language)
      helper.setLanguage(signUpStrings, language)
      helper.setLanguage(soldOutStrings, language)
      helper.setLanguage(wishlistStrings, language)

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
                backgroundColor: '#f6f6f6',
              }
            },
          },
          // MuiButton: {
          //   styleOverrides: {
          //     root: {
          //       '&.Mui-disabled': {
          //         opacity: 0.5
          //       }
          //     }
          //   },
          // },
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
                  backgroundColor: '#ddd !important'
                },
              },
            },
          },
        }
      }
        , isFr ? frFR : enUS
        , isFr ? corefrFR : coreenUS)

      setTheme(theme)
    }

    init()
  }, [])

  if (!theme) {
    return null
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          <LanguageProvider>
            <CurrencyProvider>
              <UserProvider>
                <NotificationProvider>
                  <CartProvider>
                    <WishlistProvider>
                      {children}
                    </WishlistProvider>
                  </CartProvider>
                </NotificationProvider>
              </UserProvider>
            </CurrencyProvider>
          </LanguageProvider>

          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={true}
            theme='dark'
            icon={<></>}
          />
        </CssBaseline>
      </ThemeProvider>

      <ProgressBar
        height="2px"
        color="#28b9cd"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  )
}

export default Layout
