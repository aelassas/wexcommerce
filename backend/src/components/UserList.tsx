
import * as wexcommerceTypes from ':wexcommerce-types'
import env from '@/config/env.config'
import * as UserService from '@/lib/UserService'
import { Address, Email, EmptyList, FullName, Actions, Pager, Phone, SubscribedAt } from './UserList.client'

import styles from '@/styles/user-list.module.css'

interface UserListProps {
  keyword: string
  page: number
}

const UserList = async ({ keyword, page }: UserListProps) => {
  let users: wexcommerceTypes.User[] = []
  let rowCount = 0
  let totalRecords = 0
  let noMatch = false

  try {
    if (page >= 1) {
      const data = await UserService.getUsers(keyword, page, env.PAGE_SIZE)
      const _data = data && data.length > 0 ? data[0] : { pageInfo: [{ totalRecords: 0 }], resultData: [] }
      if (!_data) {
        console.log('Users data empty')
        return
      }
      const _users = _data.resultData
      const _rowCount = ((page - 1) * env.PAGE_SIZE) + _users.length
      const _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

      if (_totalRecords > 0 && page > Math.ceil(_totalRecords / env.PAGE_SIZE)) {
        noMatch = true
      }

      users = _users
      rowCount = _rowCount
      totalRecords = _totalRecords
    }
  } catch (err) {
    console.error(err)
    noMatch = true
  }

  return (
    <div className={styles.users}>
      {
        (totalRecords === 0 || noMatch) && <EmptyList />
      }

      {
        totalRecords > 0 &&
        <>
          <div className={styles.userList}>
            {
              users.map((user) => (
                <article key={user._id} className={styles.user}>
                  <div className={styles.userContent}>
                    <div className={styles.userInfo}>
                      <FullName />
                      <span>{user.fullName}</span>
                    </div>
                    <div className={styles.userInfo}>
                      <Email />
                      <span>{user.email}</span>
                    </div>
                    <div className={styles.userInfo}>
                      <Phone />
                      <span>{user.phone || '-'}</span>
                    </div>
                    <div className={styles.userInfo}>
                      <Address />
                      <pre>{user.address || '-'}</pre>
                    </div>
                    <div className={styles.userInfo}>
                      <SubscribedAt value={user.createdAt!} />
                    </div>
                  </div>
                  <div className={styles.userActions}>
                    <Actions userId={user._id!} />
                  </div>
                </article>
              ))
            }
          </div>

          {!noMatch && (
            <Pager
              page={page}
              rowCount={rowCount}
              totalRecords={totalRecords}
              keyword={keyword}
            />
          )}

        </>
      }
    </div>
  )
}

export default UserList
