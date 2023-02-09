import React, { useEffect, useRef, useState } from 'react'
import { strings } from '../lang/notifications'
import { strings as commonStrings } from '../lang/common'
import { strings as masterStrings } from '../lang/master'
import { strings as headerStrings } from '../lang/header'
import * as UserService from '../services/UserService'
import * as NotificationService from '../services/NotificationService'
import {
    Button,
    Card,
    CardContent,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material'
import {
    Drafts as MarkReadIcon,
    Markunread as MarkUnreadIcon,
    Delete as DeleteIcon,
    ArrowBackIos as PreviousPageIcon,
    ArrowForwardIos as NextPageIcon,
    Visibility as ViewIcon
} from '@mui/icons-material'
import * as Helper from '../common/Helper'
import Env from '../config/env.config'
import { format } from 'date-fns'
import { fr, enUS } from "date-fns/locale"
import Header from '../components/Header'
import { useRouter } from 'next/router'
import Link from 'next/link'
import NoMatch from '../components/NoMatch'
import * as CartService from '../services/CartService'
import * as SettingService from '../services/SettingService'

import styles from '../styles/notifications.module.css'

const Notifications = ({
    _user,
    _signout,
    _page,
    _rowCount,
    _totalRecords,
    _notifications,
    _notificationCount,
    _noMatch,
    _language
}) => {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState([])
    const [rowCount, setRowCount] = useState(-1)
    const [totalRecords, setTotalRecords] = useState(-1)
    const [notificationCount, setNotificationCount] = useState(0)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [selectedRows, setSelectedRows] = useState([])
    const notificationsListRef = useRef(null)

    const _fr = _language === 'fr'
    const _locale = _fr ? fr : enUS
    const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm'

    useEffect(() => {
        if (_language) {
            Helper.setLanguage(strings, _language)
            Helper.setLanguage(commonStrings, _language)
            Helper.setLanguage(masterStrings, _language)
            Helper.setLanguage(headerStrings, _language)
        }
    }, [_language])

    useEffect(() => {
        if (_user) {
            setLoading(false)
        }
    }, [_user])

    useEffect(() => {
        setRows(_notifications)
        if (notificationsListRef.current) notificationsListRef.current.scrollTo(0, 0)
    }, [notificationsListRef, _notifications])

    useEffect(() => {
        setRowCount(_rowCount)
    }, [_rowCount])

    useEffect(() => {
        setTotalRecords(_totalRecords)
    }, [_totalRecords])

    useEffect(() => {
        setNotificationCount(_notificationCount)
    }, [_notificationCount])

    useEffect(() => {
        if (_signout) {
            CartService.deleteCartId()
            UserService.signout(false, true)
        }
    }, [_signout])

    const handleResend = async (e) => {
        try {
            e.preventDefault()
            const data = { email: _user.email }

            const status = await UserService.resendLink(data)

            if (status === 200) {
                Helper.info(masterStrings.VALIDATION_EMAIL_SENT)
            } else {
                Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
            }

        } catch (err) {
            Helper.error(masterStrings.VALIDATION_EMAIL_ERROR)
        }
    }

    const checkedRows = rows.filter(row => row.checked)
    const allChecked = rows.length > 0 && checkedRows.length === rows.length
    const indeterminate = checkedRows.length > 0 && checkedRows.length < rows.length

    return !loading && _user && _language &&
        <>
            <Header user={_user} language={_language} notificationCount={notificationCount} />

            {
                _user.verified &&
                <div className={styles.notifications}>

                    {_noMatch && <NoMatch className={styles.noMatch} />}

                    {
                        !_noMatch && totalRecords === 0 &&
                        <Card variant="outlined" className={styles.emptyList}>
                            <CardContent>
                                <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                            </CardContent>
                        </Card>
                    }


                    {
                        !_noMatch && totalRecords > 0 &&
                        <>
                            <div className={styles.headerContainer}>
                                <div className={styles.header}>
                                    <div className={styles.headerCheckbox}>
                                        <Checkbox
                                            checked={allChecked}
                                            indeterminate={indeterminate}
                                            onChange={(event) => {
                                                if (indeterminate) {
                                                    rows.forEach(row => {
                                                        row.checked = false
                                                    })
                                                } else {
                                                    rows.forEach(row => {
                                                        row.checked = event.target.checked
                                                    })
                                                }
                                                setRows(Helper.clone(rows))
                                            }} />
                                    </div>
                                    {
                                        checkedRows.length > 0 &&
                                        <div className={styles.headerActions}>
                                            {
                                                checkedRows.some(row => !row.isRead) &&
                                                <Tooltip title={strings.MARK_ALL_AS_READ}>
                                                    <IconButton onClick={async () => {
                                                        try {
                                                            const _rows = checkedRows.filter(row => !row.isRead)
                                                            const ids = _rows.map(row => row._id)
                                                            const status = await NotificationService.markAsRead(_user._id, ids)

                                                            if (status === 200) {
                                                                _rows.forEach(row => {
                                                                    row.isRead = true
                                                                })
                                                                setRows(Helper.clone(rows))
                                                                setNotificationCount(notificationCount - _rows.length)
                                                            } else {
                                                                Helper.error()
                                                            }
                                                        }
                                                        catch (err) {
                                                            UserService.signout()
                                                        }
                                                    }}>
                                                        <MarkReadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            {
                                                checkedRows.some(row => row.isRead) &&
                                                <Tooltip title={strings.MARK_ALL_AS_UNREAD}>
                                                    <IconButton onClick={async () => {
                                                        try {
                                                            const _rows = checkedRows.filter(row => row.isRead)
                                                            const ids = _rows.map(row => row._id)
                                                            const status = await NotificationService.markAsUnread(_user._id, ids)

                                                            if (status === 200) {
                                                                _rows.forEach(row => {
                                                                    row.isRead = false
                                                                })
                                                                setRows(Helper.clone(rows))
                                                                setNotificationCount(notificationCount + _rows.length)
                                                            } else {
                                                                Helper.error()
                                                            }
                                                        }
                                                        catch (err) {
                                                            UserService.signout()
                                                        }
                                                    }}>
                                                        <MarkUnreadIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            }
                                            <Tooltip title={strings.DELETE_ALL}>
                                                <IconButton onClick={() => {
                                                    setSelectedRows(checkedRows)
                                                    setOpenDeleteDialog(true)
                                                }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div ref={notificationsListRef} className={styles.notificationList}>
                                {
                                    rows.map((row, index) => (
                                        <div key={row._id} className={styles.notificationContainer}>
                                            <div className={styles.notificationCheckbox}>
                                                <Checkbox checked={row.checked} onChange={(event) => {
                                                    row.checked = event.target.checked
                                                    setRows(Helper.clone(rows))
                                                }} />
                                            </div>
                                            <div className={`${styles.notification}${!row.isRead ? ` ${styles.unread}` : ''}`}>
                                                <div className={styles.date}>
                                                    {Helper.capitalize(format(new Date(row.createdAt), _format, { locale: _locale }))}
                                                </div>
                                                <div className={styles.messageContainer}>
                                                    <div className={styles.message}>
                                                        {row.message}
                                                    </div>
                                                    <div className={styles.actions}>
                                                        {
                                                            row.order &&
                                                            <Tooltip title={strings.VIEW}>
                                                                <IconButton onClick={async () => {
                                                                    const redirect = () => router.replace(`/orders?o=${row.order}`)

                                                                    try {
                                                                        if (!row.isRead) {
                                                                            const status = await NotificationService.markAsRead(_user._id, [row._id])

                                                                            if (status === 200) {
                                                                                redirect()
                                                                            } else {
                                                                                Helper.error()
                                                                            }
                                                                        } else {
                                                                            redirect()
                                                                        }
                                                                    }
                                                                    catch (err) {
                                                                        UserService.signout()
                                                                    }
                                                                }}>
                                                                    <ViewIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        }
                                                        {
                                                            !row.isRead ?
                                                                <Tooltip title={strings.MARK_AS_READ}>
                                                                    <IconButton onClick={async () => {
                                                                        try {
                                                                            const status = await NotificationService.markAsRead(_user._id, [row._id])

                                                                            if (status === 200) {
                                                                                row.isRead = true
                                                                                setRows(Helper.clone(rows))
                                                                                setNotificationCount(notificationCount - 1)
                                                                            } else {
                                                                                Helper.error()
                                                                            }
                                                                        }
                                                                        catch (err) {
                                                                            UserService.signout()
                                                                        }
                                                                    }}>
                                                                        <MarkReadIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                :
                                                                <Tooltip title={strings.MARK_AS_UNREAD}>
                                                                    <IconButton onClick={async () => {
                                                                        try {
                                                                            const status = await NotificationService.markAsUnread(_user._id, [row._id])

                                                                            if (status === 200) {
                                                                                row.isRead = false
                                                                                setRows(Helper.clone(rows))
                                                                                setNotificationCount(notificationCount + 1)
                                                                            } else {
                                                                                Helper.error()
                                                                            }
                                                                        }
                                                                        catch (err) {
                                                                            UserService.signout()
                                                                        }
                                                                    }}>
                                                                        <MarkUnreadIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                        }
                                                        <Tooltip title={commonStrings.DELETE}>
                                                            <IconButton onClick={() => {
                                                                setSelectedRows([row])
                                                                setOpenDeleteDialog(true)
                                                            }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.pager}>
                                    <div className={styles.rowCount}>
                                        {`${((_page - 1) * Env.PAGE_SIZE) + 1}-${_rowCount} ${commonStrings.OF} ${_totalRecords}`}
                                    </div>

                                    <div className={styles.actions}>

                                        <Link
                                            href={`/notifications?p=${_page - 1}`}
                                            className={_page === 1 ? styles.disabled : ''}>

                                            <PreviousPageIcon className={styles.icon} />

                                        </Link>

                                        <Link
                                            href={`/notifications?p=${_page + 1}`}
                                            className={_rowCount === _totalRecords ? styles.disabled : ''}>

                                            <NextPageIcon className={styles.icon} />

                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Dialog
                                disableEscapeKeyDown
                                maxWidth="xs"
                                open={openDeleteDialog}
                            >
                                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                                <DialogContent>{selectedRows.length > 1 ? strings.DELETE_NOTIFICATIONS : strings.DELETE_NOTIFICATION}</DialogContent>
                                <DialogActions className='dialog-actions'>
                                    <Button onClick={() => {
                                        setOpenDeleteDialog(false)
                                    }} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                                    <Button onClick={async () => {
                                        try {
                                            const ids = selectedRows.map(row => row._id)
                                            const status = await NotificationService.deleteNotifications(_user._id, ids)

                                            if (status === 200) {
                                                if (selectedRows.length === rows.length) {
                                                    router.replace('/notifications')
                                                } else {
                                                    selectedRows.forEach(row => {
                                                        rows.splice(rows.findIndex(_row => _row._id === row._id), 1)
                                                    })
                                                    setRows(Helper.clone(rows))
                                                    setRowCount(rowCount - selectedRows.length)
                                                    setTotalRecords(totalRecords - selectedRows.length)
                                                }
                                                setNotificationCount(notificationCount - selectedRows.length)
                                                setOpenDeleteDialog(false)
                                            } else {
                                                Helper.error()
                                            }
                                        }
                                        catch (err) {
                                            UserService.signout()
                                        }
                                    }} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    }
                </div>
            }

            {
                !_user.verified &&
                <div className="validate-email">
                    <span>{masterStrings.VALIDATE_EMAIL}</span>
                    <Button
                        type="button"
                        variant="contained"
                        size="small"
                        className="btn-primary btn-resend"
                        onClick={handleResend}
                    >{masterStrings.RESEND}</Button>
                </div>
            }
        </>
}

export async function getServerSideProps(context) {
    let _user = null, _signout = false, _page = 1, _totalRecords = 0, _rowCount = 0,
        _notifications = [], _notificationCount = 0, _noMatch = false, _language = ''

    try {
        const currentUser = UserService.getCurrentUser(context)

        if (currentUser) {
            let status
            try {
                status = await UserService.validateAccessToken(context)
            } catch (err) {
                console.log('Unauthorized!')
            }

            if (status === 200) {
                _user = await UserService.getUser(context, currentUser.id)

                if (_user) {
                    if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p)

                    _language = await SettingService.getLanguage()

                    if (_page >= 1) {

                        const data = await NotificationService.getNotifications(context, _user._id, _page)
                        const _data = data[0]
                        _notifications = _data.resultData.map(row => ({ checked: false, ...row }))
                        _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _notifications.length
                        _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

                        const notificationCounter = await NotificationService.getNotificationCounter(context, _user._id)
                        _notificationCount = notificationCounter.count

                        if (_totalRecords > 0 && _page > Math.ceil(_totalRecords / Env.PAGE_SIZE)) {
                            _noMatch = true
                        }
                    } else {
                        _noMatch = true
                    }
                } else {
                    _signout = true
                }
            } else {
                _signout = true
            }
        } else {
            _signout = true
        }
    } catch (err) {
        console.log(err)
        _signout = true
    }

    return {
        props: {
            _user,
            _signout,
            _page,
            _rowCount,
            _totalRecords,
            _notifications,
            _notificationCount,
            _noMatch,
            _language
        }
    }
}

export default Notifications