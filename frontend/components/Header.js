import React, { useState, useEffect, useRef } from 'react'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings } from '../lang/header'
import * as UserService from '../services/UserService'
import * as NotificationService from '../services/NotificationService'
import * as CartService from '../services/CartService'
import * as Helper from '../common/Helper'
import Avatar from './Avatar'
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    MenuItem,
    Menu,
    Button,
    Drawer,
    InputBase
} from '@mui/material'
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    More as MoreIcon,
    Language as LanguageIcon,
    Settings as SettingsIcon,
    Home as HomeIcon,
    Inventory as OrdersIcon,
    ExitToApp as SignoutIcon,
    Login as LoginIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    Clear as ClearIcon,
    ShoppingCart as CartIcon
} from '@mui/icons-material'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Backdrop from './SimpleBackdrop'

import styles from '../styles/header.module.css'

export default function Header(props) {
    const router = useRouter()
    const [lang, setLang] = useState(Env.DEFAULT_LANGUAGE)
    const [anchorEl, setAnchorEl] = useState(null)
    const [langAnchorEl, setLangAnchorEl] = useState(null)
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)
    const [sideAnchorEl, setSideAnchorEl] = useState(null)
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [notificationCount, setNotificationCount] = useState(0)
    const [loading, setIsLoading] = useState(true)
    const [isLoaded, setIsLoaded] = useState(false)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [showPlaceholder, setShowPlaceholder] = useState(true)
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const showPlacehoder = () => setShowPlaceholder(true)
    const hidePlaceholder = () => setShowPlaceholder(false)
    const searchRef = useRef()

    const isMenuOpen = Boolean(anchorEl)
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
    const isLangMenuOpen = Boolean(langAnchorEl)
    const isSideMenuOpen = Boolean(sideAnchorEl)

    useEffect(() => {
        if (router.query.s) {
            setSearchKeyword(router.query.s)
        } else {
            setSearchKeyword('')
        }
    }, [router.query])

    // useEffect(() => {
    //     const language = UserService.getLanguage()
    //     setLang(language)
    //     Helper.setLanguage(strings)
    //     Helper.setLanguage(commonStrings)
    // }, [])

    useEffect(() => {
        if (props.language) {
            Helper.setLanguage(commonStrings, props.language)
            Helper.setLanguage(strings, props.language)
        }
    }, [props.language])

    useEffect(() => {
        if (!props.hidden) {
            if (props.user) {
                NotificationService.getNotificationCounter(null, props.user._id)
                    .then(notificationCounter => {
                        setIsSignedIn(true)
                        setNotificationCount(notificationCounter.count)
                        setIsLoading(false)
                        setIsLoaded(true)
                    })
                    .catch((err) => {
                        UserService.signout(false, true)
                    })
            } else {
                setIsLoading(false)
                setIsLoaded(true)
            }
        }
    }, [props.hidden, props.user])

    useEffect(() => {
        if (!props.hidden) {
            if (props.notificationCount) {
                setNotificationCount(props.notificationCount)
            } else {
                setNotificationCount(0)
            }
        }
    }, [props.hidden, props.notificationCount])

    useEffect(() => {
        if (showMobileSearch && searchRef.current && searchRef.current.firstChild) {
            searchRef.current.firstChild.focus()
        }
    }, [showMobileSearch, searchRef])

    useEffect(() => {
        (async function () {
            const cartId = CartService.getCartId()

            if (cartId) {
                const cartCount = await CartService.getCartCount(cartId)
                setCartCount(cartCount)
            }
        })()
    }, [])

    useEffect(() => {
        setCartCount(props.cartCount)
    }, [props.cartCount])

    useEffect(() => {
        if (props.signout) {
            setIsSignedIn(false)
            const cartId = CartService.getCartId()

            if (!cartId) {
                setCartCount(0)
            }
        }
    }, [props.signout])

    const search = (keyword) => {
        const url = router.pathname.includes('/orders') ?
            (keyword ? '/orders?s=' + encodeURIComponent(keyword) : '/orders')
            : (keyword ? '/?s=' + encodeURIComponent(keyword) : '/')

        router.replace(url)
    }

    const handleSearch = (e) => {
        const keyword = e.currentTarget.value

        if (e.key === 'Enter') {
            setShowMobileSearch(false)
            search(keyword)
        } else {
            setSearchKeyword(keyword)
        }
    }

    const handleSearchChange = (e) => {
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
        },
    }

    const handleAccountMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null)
    }

    const handleLangMenuOpen = (event) => {
        setLangAnchorEl(event.currentTarget)
    }

    const refreshPage = () => {
        router.reload(router.asPath)
    }

    const handleLangMenuClose = async (event) => {
        setLangAnchorEl(null)

        const { code } = event.currentTarget.dataset
        if (code) {
            setLang(code)
            const currentLang = UserService.getLanguage()
            if (isSignedIn) {
                // Update user language
                const data = {
                    id: props.user._id,
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
                    Helper.info(commonStrings.CHANGE_LANGUAGE_ERROR)
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

    const getLang = (lang) => {
        switch (lang) {
            case 'fr':
                return strings.LANGUAGE_FR
            case 'en':
                return strings.LANGUAGE_EN
            default:
                return Env.DEFAULT_LANGUAGE
        }
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
        handleMobileMenuClose()
    }

    const handleOnSettingsClick = () => {
        router.replace('/settings')
    }

    const handleSignout = () => {
        UserService.signout(true, false, true)
    }

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget)
    }

    const handleSideMenuOpen = (event) => {
        setSideAnchorEl(event.currentTarget)
    }

    const handleSideMenuClose = () => {
        setSideAnchorEl(null)
    }

    const handleNotificationsClick = (e) => {
        router.replace('/notifications')
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
            <MenuItem onClick={handleLangMenuOpen}>
                <IconButton
                    aria-label="language of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <LanguageIcon />
                </IconButton>
                <p>{strings.LANGUAGE}</p>
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

    return !props.hidden &&
        <div style={classes.grow} className={styles.header}>
            <AppBar position="relative" sx={{ bgcolor: '#fff', boxShadow: 'none', borderBottom: '1px solid #ddd', zIndex: showMobileSearch ? 1202 : 1 }}>
                <Toolbar>
                    <div
                        className={styles.headerLogo}
                        style={{
                            display: showMobileSearch ? 'none' : 'flex',
                            minWidth: isSignedIn || Env.isMobile() ? 160 : 140
                        }}>
                        {
                            isLoaded && !loading && !showMobileSearch &&
                            <>
                                {
                                    (isSignedIn || Env.isMobile()) &&
                                    <IconButton
                                        edge="start"
                                        sx={classes.menuButton}
                                        color="inherit"
                                        aria-label="open drawer"
                                        onClick={handleSideMenuOpen}
                                        className={styles.iconButton}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                }


                                <Link href='/' className={styles.logo}>
                                    <img className={styles.logo} src="/logo.png" alt="" />
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

                    {!props.hideSearch &&
                        <div className={styles.searchContainer}>
                            <div className={`${styles.search}${(showMobileSearch && ` ${styles.mobileSearch}`) || ''}`}>
                                <div className={`${styles.searchInput}${(showMobileSearch && ` ${styles.mobileSearchInput}`) || ''}`}>
                                    {showPlaceholder && !searchKeyword && (
                                        <div className={styles.searchPlaceholder}>
                                            <span>{
                                                router.pathname.includes('/orders') ?
                                                    strings.SEARCH_ORDERS_PLACEHOLDER
                                                    : strings.SEARCH_PRODUCTS_PLACEHOLDER
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
                                            if (!Env.isMobile()) hidePlaceholder()
                                        }}
                                        onBlur={showPlacehoder}
                                    />
                                </div>
                                {
                                    searchKeyword && // showMobileSearch &&
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
                                        if (Env.isMobile() && !showMobileSearch) {
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

                    <React.Fragment>
                        <Drawer open={isSideMenuOpen} onClose={handleSideMenuClose}>
                            <ul className={styles.menu}>
                                <li>
                                    <Link href="/" className={styles.menuItem}>

                                        <HomeIcon className={styles.menuItemIcon} />
                                        <span className={styles.menuItemText}>{strings.HOME}</span>

                                    </Link>
                                </li>
                                {isSignedIn &&
                                    <li>
                                        <Link href="/orders" className={styles.menuItem}>

                                            <OrdersIcon className={styles.menuItemIcon} />
                                            <span className={styles.menuItemText}>{strings.ORDERS}</span>

                                        </Link>
                                    </li>
                                }
                                {!isSignedIn && Env.isMobile() &&
                                    <li>
                                        <Link href="/sign-in" className={styles.menuItem}>

                                            <LoginIcon className={styles.menuItemIcon} />
                                            <span className={styles.menuItemText}>{strings.SIGN_IN}</span>

                                        </Link>
                                    </li>
                                }
                            </ul>
                        </Drawer>
                    </React.Fragment>

                    <div style={classes.grow} />

                    <div
                        className={styles.headerDesktop}
                    >
                        {!props.hideCart &&
                            <IconButton
                                onClick={(e) => {
                                    router.replace('/cart')
                                }}
                                className={styles.iconButton}
                            >
                                <Badge badgeContent={cartCount > 0 ? cartCount : null} color="error">
                                    <CartIcon />
                                </Badge>
                            </IconButton>}
                        {isSignedIn && !props.hideNotification &&
                            <IconButton
                                onClick={handleNotificationsClick}
                                className={styles.iconButton}
                            >
                                <Badge badgeContent={notificationCount > 0 ? notificationCount : null} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>}
                        {(!props.hideSignIn && !isSignedIn && isLoaded && !loading) &&
                            <Link href='sign-in' className={styles.signin}>

                                <LoginIcon className={styles.signinIcon} />
                                <span>{strings.SIGN_IN}</span>

                            </Link>
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
                        {
                            isSignedIn && <IconButton
                                edge="end"
                                aria-label="account"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleAccountMenuOpen}
                                color="inherit"
                                className={styles.iconButton}
                                style={{ width: 52 }}
                            >
                                <Avatar loggedUser={props.user} language={props.language} user={props.user} size="small" readonly />
                            </IconButton>
                        }
                    </div>

                    {isLoaded && !loading && !showMobileSearch &&
                        <div className={styles.headerMobile}>
                            {!props.hideCart && <IconButton
                                onClick={(e) => {
                                    router.replace('/cart')
                                }}
                                className={styles.iconButton}
                            >
                                <Badge badgeContent={cartCount > 0 ? cartCount : null} color="error">
                                    <CartIcon />
                                </Badge>
                            </IconButton>}
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