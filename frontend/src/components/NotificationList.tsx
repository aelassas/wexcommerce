'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Drafts as MarkReadIcon,
  Markunread as MarkUnreadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr, enUS } from "date-fns/locale"
import * as wexcommerceTypes from ':wexcommerce-types'
import * as wexcommerceHelper from ':wexcommerce-helper'
import { LanguageContextType, useLanguageContext } from '@/context/LanguageContext'
import { UserContextType, useUserContext } from '@/context/UserContext'
import { NotificationContextType, useNotificationContext } from '@/context/NotificationContext'
import env from '@/config/env.config'
import { strings } from '@/lang/notification-list'
import { strings as commonStrings } from '@/lang/common'
import * as NotificationService from '@/lib/NotificationService'
import * as helper from '@/common/helper'
import Pager from './Pager'
import EmptyListComponent from './EmptyList'

import styles from '@/styles/notification-list.module.css'

export const EmptyList: React.FC = () => (
  <EmptyListComponent text={strings.EMPTY_LIST} marginTop />
)

interface NotificationListProps {
  page: number
  rowCount: number
  totalRecords: number
  notifications: wexcommerceTypes.Notification[]
}

interface NotificationRow extends wexcommerceTypes.Notification {
  checked?: boolean
}

const NotificationList: React.FC<NotificationListProps> = (
  {
    page,
    rowCount: rowCountFromProps,
    totalRecords: totalRecordsFromProps,
    notifications: notificationsFromProps,
  }) => {
  const router = useRouter()

  const { language } = useLanguageContext() as LanguageContextType
  const { user } = useUserContext() as UserContextType
  const { notificationCount, setNotificationCount } = useNotificationContext() as NotificationContextType

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [notifications, setNotifications] = useState<NotificationRow[]>(notificationsFromProps)
  const [selectedNotifications, setSelectedNotifications] = useState<NotificationRow[]>([])
  const [rowCount, setRowCount] = useState(rowCountFromProps)
  const [totalRecords, setTotalRecords] = useState(totalRecordsFromProps)

  const notificationsListRef = useRef(null)

  useEffect(() => {
    setNotifications(notificationsFromProps)
  }, [notificationsFromProps])

  useEffect(() => {
    setRowCount(rowCountFromProps)
  }, [rowCountFromProps])

  useEffect(() => {
    setTotalRecords(totalRecordsFromProps)
  }, [totalRecordsFromProps])

  const _fr = language === 'fr'
  const _locale = _fr ? fr : enUS
  const _format = wexcommerceHelper.getDateFormat(language)

  const checkedRows = notifications.filter((row) => row.checked)
  const allChecked = notifications.length > 0 && checkedRows.length === notifications.length
  const indeterminate = checkedRows.length > 0 && checkedRows.length < notifications.length

  return user && language && (
    <div className={styles.notifications}>

      {
        totalRecords === 0 && <EmptyList />
      }

      {
        totalRecords > 0 &&
        <>
          <div className={styles.headerContainer}>
            <div className={styles.header}>
              <div className={styles.headerCheckbox}>
                <Checkbox
                  checked={allChecked}
                  indeterminate={indeterminate}
                  onChange={(event) => {
                    if (indeterminate) {
                      notifications.forEach(row => {
                        row.checked = false
                      })
                    } else {
                      notifications.forEach(row => {
                        row.checked = event.target.checked
                      })
                    }
                    setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
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
                          const _notifications = checkedRows.filter(row => !row.isRead)
                          const ids = _notifications.map(row => row._id)
                          const status = await NotificationService.markAsRead(user._id!, ids)

                          if (status === 200) {
                            _notifications.forEach(row => {
                              row.isRead = true
                            })
                            setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
                            setNotificationCount(notificationCount - _notifications.length)
                          } else {
                            helper.error()
                          }
                        } catch (err) {
                          helper.error(err)
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
                          const _notifications = checkedRows.filter(row => row.isRead)
                          const ids = _notifications.map(row => row._id)
                          const status = await NotificationService.markAsUnread(user._id!, ids)

                          if (status === 200) {
                            _notifications.forEach(row => {
                              row.isRead = false
                            })
                            setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
                            setNotificationCount(notificationCount + _notifications.length)
                          } else {
                            helper.error()
                          }
                        } catch (err) {
                          helper.error(err)
                        }
                      }}>
                        <MarkUnreadIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  <Tooltip title={strings.DELETE_ALL}>
                    <IconButton onClick={() => {
                      setSelectedNotifications(checkedRows)
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
              notifications.map((row) => (
                <div key={row._id} className={styles.notificationContainer}>
                  <div className={styles.notificationCheckbox}>
                    <Checkbox checked={row.checked} onChange={(event) => {
                      row.checked = event.target.checked
                      setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
                    }} />
                  </div>
                  <div className={`${styles.notification}${!row.isRead ? ` ${styles.unread}` : ''}`}>
                    <div className={styles.date}>
                      {wexcommerceHelper.capitalize(format(new Date(row.createdAt!), _format, { locale: _locale }))}
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
                              const redirect = () => router.push(`/orders?o=${row.order}`)

                              try {
                                if (!row.isRead) {
                                  const status = await NotificationService.markAsRead(user._id!, [row._id])

                                  if (status === 200) {
                                    if (!row.isRead) {
                                      setNotificationCount(notificationCount - 1)
                                    }
                                    redirect()
                                  } else {
                                    helper.error()
                                  }
                                } else {
                                  redirect()
                                }
                              } catch (err) {
                                helper.error(err)
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
                                  const status = await NotificationService.markAsRead(user._id!, [row._id])

                                  if (status === 200) {
                                    row.isRead = true
                                    setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
                                    setNotificationCount(notificationCount - 1)
                                  } else {
                                    helper.error()
                                  }
                                } catch (err) {
                                  helper.error(err)
                                }
                              }}>
                                <MarkReadIcon />
                              </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title={strings.MARK_AS_UNREAD}>
                              <IconButton onClick={async () => {
                                try {
                                  const status = await NotificationService.markAsUnread(user._id!, [row._id])

                                  if (status === 200) {
                                    row.isRead = false
                                    setNotifications(wexcommerceHelper.cloneArray(notifications) as NotificationRow[])
                                    setNotificationCount(notificationCount + 1)
                                  } else {
                                    helper.error()
                                  }
                                } catch (err) {
                                  helper.error(err)
                                }
                              }}>
                                <MarkUnreadIcon />
                              </IconButton>
                            </Tooltip>
                        }
                        <Tooltip title={commonStrings.DELETE}>
                          <IconButton onClick={() => {
                            setSelectedNotifications([row])
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
            <Pager
              page={page}
              pageSize={env.PAGE_SIZE}
              rowCount={rowCount}
              totalRecords={totalRecords}
              className={styles.pager}
              onPrevious={() => router.push(`/notifications?p=${page - 1}`)}
              onNext={() => router.push(`/notifications?p=${page + 1}`)}
            />
          </div>

        </>
      }


      <Dialog
        disableEscapeKeyDown
        maxWidth="xs"
        open={openDeleteDialog}
      >
        <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent>{selectedNotifications.length > 1 ? strings.DELETE_NOTIFICATIONS : strings.DELETE_NOTIFICATION}</DialogContent>
        <DialogActions className='dialog-actions'>
          <Button
            variant='outlined'
            onClick={() => {
              setOpenDeleteDialog(false)
            }}>
            {commonStrings.CANCEL}
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={async () => {
              try {
                const ids = selectedNotifications.map((row) => row._id)
                const status = await NotificationService.deleteNotifications(user._id!, ids)

                if (status === 200) {
                  if (selectedNotifications.length === notifications.length) {
                    if (page === 1) {
                      router.refresh()
                    } else {
                      router.replace('/notifications')
                    }
                  } else {
                    router.refresh()
                  }
                  setNotificationCount(notificationCount - selectedNotifications.filter((row) => !row.isRead).length)
                  setOpenDeleteDialog(false)
                } else {
                  helper.error()
                }
              } catch (err) {
                helper.error(err)
              }
            }}>{commonStrings.DELETE}</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default NotificationList
