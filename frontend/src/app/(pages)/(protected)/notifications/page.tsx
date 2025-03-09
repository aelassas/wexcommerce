import React, { Suspense } from 'react'
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'
import * as NotificationService from '@/lib/NotificationService'
import NotificationList, { EmptyList } from '@/components/NotificationList'
import Indicator from '@/components/Indicator'
import ScrollToTop from '@/components/ScrollToTop'

import styles from '@/styles/notifications.module.css'

const Notifications = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams
  let page = 1
  const p = searchParams['p'] as string
  if (p) {
    const _p = Number.parseInt(p, 10)
    if (_p > 0) {
      page = _p
    }
  }
  let notifications: wexcommerceTypes.Notification[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  const user = await UserService.getCurrentUser()
  if (user && page >= 1) {
    try {
      const data = await NotificationService.getNotifications(user._id!, page)
      const _data = data && data.length > 0 ? data[0] : { pageInfo: [{ totalRecords: 0 }], resultData: [] }
      if (!_data) {
        console.log('Notifications data empty')
        return
      }

      const _notifications = _data.resultData.map((row) => ({ checked: false, ...row }))
      const _rowCount = ((page - 1) * env.PAGE_SIZE) + _notifications.length
      const _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      if (_totalRecords > 0 && page > Math.ceil(_totalRecords / env.PAGE_SIZE)) {
        noMatch = true
      }

      notifications = _notifications
      rowCount = _rowCount
      totalRecords = _totalRecords
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Suspense fallback={<Indicator />}>
      <ScrollToTop />

      <div className={styles.notifications}>
        {
          noMatch ? (
            <EmptyList />
          )
            : (
              <NotificationList
                page={page}
                rowCount={rowCount}
                totalRecords={totalRecords}
                notifications={notifications}
              />
            )
        }
      </div>
    </Suspense>
  )
}

export default Notifications
