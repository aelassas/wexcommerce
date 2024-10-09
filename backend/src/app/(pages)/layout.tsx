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
import * as helper from '@/common/helper'

import { strings as activateStrings } from '@/lang/activate'
import { strings as categoriesStrings } from '@/lang/categories'
import { strings as categoryListStrings } from '@/lang/category-list'
import { strings as categoryStrings } from '@/lang/category'
import { strings as changePasswordStrings } from '@/lang/change-password'
import { strings as commonStrings } from '@/lang/common'
import { strings as createCategoryStrings } from '@/lang/create-category'
import { strings as createProductStrings } from '@/lang/create-product'
import { strings as dashboardStrings } from '@/lang/dashboard'
import { strings as forgotPasswordStrings } from '@/lang/forgot-password'
import { strings as headerStrings } from '@/lang/header'
import { strings as homeStrings } from '@/lang/home'
import { strings as imageEditorStrings } from '@/lang/image-editor'
import { strings as noMatchStrings } from '@/lang/no-match'
import { strings as notificationListStrings } from '@/lang/notification-list'
import { strings as orderDateFilterStrings } from '@/lang/order-date-filter'
import { strings as orderListStrings } from '@/lang/order-list'
import { strings as orderStatusStrings } from '@/lang/order-status'
import { strings as productListStrings } from '@/lang/product-list'
import { strings as productStrings } from '@/lang/product'
import { strings as productsStrings } from '@/lang/products'
import { strings as settingsStrings } from '@/lang/settings'
import { strings as signInStrings } from '@/lang/sign-in'
import { strings as signUpStrings } from '@/lang/sign-up'
import { strings as userListStrings } from '@/lang/user-list'

import 'react-toastify/dist/ReactToastify.min.css'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import '@/styles/globals.css'

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
      helper.setLanguage(categoriesStrings, language)
      helper.setLanguage(categoryListStrings, language)
      helper.setLanguage(categoryStrings, language)
      helper.setLanguage(changePasswordStrings, language)
      helper.setLanguage(commonStrings, language)
      helper.setLanguage(createCategoryStrings, language)
      helper.setLanguage(createProductStrings, language)
      helper.setLanguage(dashboardStrings, language)
      helper.setLanguage(forgotPasswordStrings, language)
      helper.setLanguage(headerStrings, language)
      helper.setLanguage(homeStrings, language)
      helper.setLanguage(imageEditorStrings, language)
      helper.setLanguage(noMatchStrings, language)
      helper.setLanguage(notificationListStrings, language)
      helper.setLanguage(orderDateFilterStrings, language)
      helper.setLanguage(orderListStrings, language)
      helper.setLanguage(orderStatusStrings, language)
      helper.setLanguage(productListStrings, language)
      helper.setLanguage(productStrings, language)
      helper.setLanguage(productsStrings, language)
      helper.setLanguage(settingsStrings, language)
      helper.setLanguage(signInStrings, language)
      helper.setLanguage(signUpStrings, language)
      helper.setLanguage(userListStrings, language)

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
                  {children}
                </NotificationProvider>
              </UserProvider>
            </CurrencyProvider>
          </LanguageProvider>

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={true}
            theme="light"
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
