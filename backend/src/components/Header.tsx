'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Menu,
  Drawer,
  InputBase
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  More as MoreIcon,
  Settings as SettingsIcon,
  Inventory as OrdersIcon,
  AccountTree as CategoriesIcon,
  ShoppingBag as ProductsIcon,
  ExitToApp as SignoutIcon,
  Person as UsersIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import env from '@/config/env.config'
import * as helper from '@/common/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/header'
import * as UserService from '@/lib/UserService'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { NotificationContextType, useNotificationContext } from '@/context/NotificationContext'
import Avatar from './Avatar'
import Backdrop from './SimpleBackdrop'

import styles from '@/styles/header.module.css'

interface HeaderProps {
  hidden?: boolean
  hideSearch?: boolean
}

const Header: React.FC<HeaderProps> = ({ hidden, hideSearch }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { user, setUser } = useUserContext() as UserContextType
  const { notificationCount } = useNotificationContext() as NotificationContextType

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [langAnchorEl, setLangAnchorEl] = useState<HTMLElement | null>(null)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null)
  const [sideAnchorEl, setSideAnchorEl] = useState<HTMLElement | null>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [loading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showPlaceholder, setShowPlaceholder] = React.useState(true)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const showPlacehoder = () => setShowPlaceholder(true)
  const hidePlaceholder = () => setShowPlaceholder(false)
  const searchRef = useRef<HTMLElement>()

  const isMenuOpen = Boolean(anchorEl)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const isLangMenuOpen = Boolean(langAnchorEl)
  const isSideMenuOpen = Boolean(sideAnchorEl)

  useEffect(() => {
    const s = searchParams.get('s')
    if (s) {
      setSearchKeyword(s)
    } else {
      setSearchKeyword('')
    }
  }, [searchParams])

  useEffect(() => {
    if (!hidden) {
      if (user) {
        setIsSignedIn(true)
        setIsLoading(false)
        setIsLoaded(true)
      } else {
        setIsLoading(false)
        setIsLoaded(true)
      }
    }
  }, [hidden, user])

  useEffect(() => {
    if (showMobileSearch && searchRef.current && searchRef.current.firstChild) {
      (searchRef.current.firstChild as HTMLInputElement).focus()
    }
  }, [showMobileSearch, searchRef])

  const showSearch = pathname.includes('/categories')
    || pathname.includes('/products')
    || pathname.includes('/users')
    || pathname.includes('/orders')

  const search = (keyword: string) => {
    const url = pathname.includes('/categories') ?
      (keyword ? '/categories?s=' + encodeURIComponent(keyword) : '/categories')
      : pathname.includes('/products') ?
        (keyword ? '/products?s=' + encodeURIComponent(keyword) : '/products')
        : pathname.includes('/users') ?
          (keyword ? '/users?s=' + encodeURIComponent(keyword) : '/users')
          : (keyword ? '/orders?s=' + encodeURIComponent(keyword) : '/orders')

    router.push(url)
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const keyword = e.currentTarget.value

    if (e.key === 'Enter') {
      setShowMobileSearch(false)
      search(keyword)
    } else {
      setSearchKeyword(keyword)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchKeyword(e.target.value)
  }

  const classes = {
    list: {
      width: 250,
    },
    formControl: {
      margin: 1,
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: 2,
    },
    grow: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: 2,
    }
  }

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  const refreshPage = () => {
    router.refresh()
  }

  const handleLangMenuClose = async (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(null)

    const { code } = event.currentTarget.dataset
    if (code) {
      const currentLang = await UserService.getLanguage()

      if (isSignedIn) {
        // Update user language
        const data = {
          id: user!._id!,
          language: code
        }
        const status = await UserService.updateLanguage(data)
        if (status === 200) {
          UserService.setLanguage(code)
          if (code && code !== currentLang) {
            // Refresh page
            refreshPage()
          }
        } else {
          helper.info(commonStrings.CHANGE_LANGUAGE_ERROR)
        }
      } else {
        UserService.setLanguage(code)
        if (code && code !== currentLang) {
          // Refresh page
          refreshPage()
        }
      }
    }
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    handleMobileMenuClose()
  }

  const handleOnSettingsClick = () => {
    handleMenuClose()
    router.push('/settings')
  }

  const handleSignout = async () => {
    setUser(null)
    await UserService.signout()
  }

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleSideMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSideAnchorEl(event.currentTarget)
  }

  const handleSideMenuClose = () => {
    setSideAnchorEl(null)
  }

  const handleNotificationsClick = () => {
    router.push('/notifications')
  }

  const menuId = 'primary-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleOnSettingsClick}>
        <SettingsIcon className={styles.headerAction} />
        {strings.SETTINGS}
      </MenuItem>
      <MenuItem onClick={handleSignout}>{
        <SignoutIcon className={styles.headerAction} />}
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const mobileMenuId = 'mobile-menu'
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleOnSettingsClick}>
        <IconButton
          color="inherit"
        >
          <SettingsIcon />
        </IconButton>
        <p>{strings.SETTINGS}</p>
      </MenuItem>
      <MenuItem onClick={handleSignout}>
        <IconButton color="inherit">
          <SignoutIcon />
        </IconButton>
        <Typography>{strings.SIGN_OUT}</Typography>
      </MenuItem>
    </Menu>
  )

  const languageMenuId = 'language-menu'
  const renderLanguageMenu = (
    <Menu
      anchorEl={langAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={languageMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isLangMenuOpen}
      onClose={handleLangMenuClose}
    >
      <MenuItem onClick={handleLangMenuClose} data-code="fr">{strings.LANGUAGE_FR}</MenuItem>
      <MenuItem onClick={handleLangMenuClose} data-code="en">{strings.LANGUAGE_EN}</MenuItem>
    </Menu>
  )

  return !hidden &&
    <div style={classes.grow} className={styles.header}>
      <AppBar position="relative" sx={{ bgcolor: '#fff', boxShadow: 'none', borderBottom: '1px solid #ddd', zIndex: showMobileSearch ? 1202 : 1 }}>
        <Toolbar>
          <div
            className={styles.headerLogo}
            style={{
              display: showMobileSearch ? 'none' : 'flex',
              minWidth: isSignedIn ? 160 : 140
            }}>
            {
              isLoaded && !loading && !showMobileSearch &&
              <>
                {
                  isSignedIn &&
                  <IconButton
                    edge="start"
                    sx={classes.menuButton}
                    color="inherit"
                    aria-label="open drawer"
                    className={styles.iconButton}
                    onClick={handleSideMenuOpen}
                  >
                    <MenuIcon />
                  </IconButton>
                }

                <Link href='/' className={styles.logo}>
                  <Image
                    alt=""
                    src="/logo.png"
                    width={0}
                    height={0}
                    sizes='100vw'
                    priority={true}
                    className={styles.logo}
                  />
                </Link>
              </>
            }
          </div>

          {
            showMobileSearch &&
            <div
              className={styles.backIcon}
              onClick={() => {
                setSearchKeyword('')
                setShowMobileSearch(false)
              }}>
              <ArrowBackIcon />
            </div>
          }

          {isSignedIn && !hideSearch && showSearch &&
            <div className={styles.searchContainer}>
              <div className={`${styles.search}${(showMobileSearch && ` ${styles.mobileSearch}`) || ''}`}>
                <div className={`${styles.searchInput}${(showMobileSearch && ` ${styles.mobileSearchInput}`) || ''}`}>
                  {showPlaceholder && !searchKeyword && (
                    <div className={styles.searchPlaceholder}>
                      <span>{
                        pathname.includes('/categories') ?
                          strings.SEARCH_CATEGORIES_PLACEHOLDER
                          : pathname.includes('/products') ?
                            strings.SEARCH_PRODUCTS_PLACEHOLDER
                            : pathname.includes('/users') ?
                              strings.SEARCH_USERS_PLACEHOLDER
                              : strings.SEARCH_ORDERS_PLACEHOLDER
                      }</span>
                    </div>
                  )}
                  <InputBase
                    ref={searchRef}
                    classes={{
                      root: styles.inputRoot,
                      input: styles.inputInput
                    }}
                    onKeyDown={handleSearch}
                    onChange={handleSearchChange}
                    value={searchKeyword}
                    onFocus={() => {
                      if (!env.isMobile()) {
                        hidePlaceholder()
                      }
                    }}
                    onBlur={showPlacehoder}
                  />
                </div>
                {
                  searchKeyword && (!env.isMobile() || (env.isMobile() && showMobileSearch)) &&
                  <div className={styles.clearIcon}
                    onClick={() => {
                      setSearchKeyword('')

                      let input
                      if (searchRef.current) {
                        input = searchRef.current.querySelector('input')
                      }

                      if (input) {
                        input.focus()
                      }
                    }}>
                    <ClearIcon />
                  </div>
                }
                <div className={`${styles.searchIcon}${(showMobileSearch && ` ${styles.mobileSearchIcon}`) || ''}`}
                  onClick={() => {
                    if (env.isMobile() && !showMobileSearch) {
                      return setShowMobileSearch(true)
                    }

                    setShowMobileSearch(false)

                    search(searchKeyword)
                  }}>
                  <SearchIcon />
                </div>
              </div>
            </div>
          }

          <>
            <Drawer open={isSideMenuOpen} onClose={handleSideMenuClose}>
              <ul className={styles.menu}>
                <li>
                  <Link href="/orders" className={styles.menuItem} onClick={handleSideMenuClose}>

                    <OrdersIcon className={styles.menuItemIcon} />
                    <span className={styles.menuItemText}>{strings.ORDERS}</span>

                  </Link>
                </li>
                {isSignedIn &&
                  <>
                    <li>
                      <Link href="/categories" className={styles.menuItem} onClick={handleSideMenuClose}>

                        <CategoriesIcon className={styles.menuItemIcon} />
                        <span className={styles.menuItemText}>{strings.CATEGORIES}</span>

                      </Link>
                    </li>
                    <li>
                      <Link href="/products" className={styles.menuItem} onClick={handleSideMenuClose}>

                        <ProductsIcon className={styles.menuItemIcon} />
                        <span className={styles.menuItemText}>{strings.PRODUCTS} </span>

                      </Link>
                    </li>
                    <li>
                      <Link href="/users" className={styles.menuItem} onClick={handleSideMenuClose}>

                        <UsersIcon className={styles.menuItemIcon} />
                        <span className={styles.menuItemText}>{strings.USERS}</span>

                      </Link>
                    </li>
                  </>
                }
              </ul>
            </Drawer>
          </>

          <div style={classes.grow} />

          <div className={styles.headerDesktop}>
            {isSignedIn &&
              <>
                <IconButton
                  onClick={handleNotificationsClick}
                  className={styles.iconButton}
                >
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </>
            }
            {/* {(isLoaded && !loading) &&
                        <Button
                            variant="contained"
                            startIcon={<LanguageIcon />}
                            onClick={handleLangMenuOpen}
                            disableElevation
                            fullWidth
                            className={styles.button}
                        >
                            {getLang(lang)}
                        </Button>} */}
            {isSignedIn && <IconButton
              edge="end"
              aria-label="account"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleAccountMenuOpen}
              color="inherit"
              className={styles.iconButton}
              style={{ width: 52 }}
            >
              <Avatar size="small" />
            </IconButton>}
          </div>

          {
            isLoaded && !loading && !showMobileSearch &&
            <div className={styles.headerMobile}>
              {/* {(!isSignedIn && !loading) &&
                            <Button
                                variant="contained"
                                startIcon={<LanguageIcon />}
                                onClick={handleLangMenuOpen}
                                disableElevation
                                fullWidth
                                className={styles.button}
                            >
                                {getLang(lang)}
                            </Button>
                        } */}
              {isSignedIn &&
                <IconButton color="inherit" onClick={handleNotificationsClick} className={styles.iconButton}>
                  <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              }
              {isSignedIn && <IconButton
                aria-label="show more"
                aria-controls={mobileMenuId}
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
                className={styles.iconButton}
              >
                <MoreIcon />
              </IconButton>
              }
            </div>
          }

        </Toolbar>
      </AppBar>

      {showMobileSearch && <Backdrop />}
      {renderMobileMenu}
      {renderMenu}
      {renderLanguageMenu}
    </div >
}

export default Header
