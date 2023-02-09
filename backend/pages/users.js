import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import { strings } from '../lang/users'
import { strings as masterStrings } from '../lang/master'
import { strings as commonStrings } from '../lang/common'
import { strings as headerStrings } from '../lang/header'
import * as Helper from '../common/Helper'
import * as UserService from '../services/UserService'
import {
  Button,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material'
import {
  Inventory as OrdersIcon,
  ArrowBackIos as PreviousPageIcon,
  ArrowForwardIos as NextPageIcon
} from '@mui/icons-material'
import Env from '../config/env.config'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr, enUS } from "date-fns/locale"
import NoMatch from '../components/NoMatch'
import { useRouter } from 'next/router'
import * as SettingService from '../services/SettingService'

import styles from '../styles/users.module.css'

const Users = ({
  _user,
  _signout,
  _keyword,
  _page,
  _rowCount,
  _totalRecords,
  _users,
  _noMatch,
  _language
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const userListRef = useRef()

  const _fr = _language === 'fr'
  const _format = _fr ? 'eee d LLLL, kk:mm' : 'eee, d LLLL, kk:mm'
  const _locale = _fr ? fr : enUS

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
    if (_signout) {
      UserService.signout()
    }
  }, [_signout])

  useEffect(() => {
    if (userListRef.current) userListRef.current.scrollTo(0, 0)
  }, [_users, userListRef])

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

  return !loading && _user && _language &&
    <>
      <Header user={_user} language={_language} />
      {
        _user.verified &&
        <div className='content'>

          {_noMatch && <NoMatch language={_language} />}

          {!_noMatch &&
            <div className={styles.users}>
              {
                _totalRecords === 0 &&
                <Card variant="outlined" className={styles.emptyList}>
                  <CardContent>
                    <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                  </CardContent>
                </Card>
              }

              {
                _totalRecords > 0 &&
                <>
                  <div ref={userListRef} className={styles.userList}>
                    {
                      _users.map((user) => (
                        <article key={user._id} className={styles.user}>
                          <div className={styles.userContent}>
                            <div className={styles.userInfo}>
                              <span className={styles.userLabel}>{commonStrings.FULL_NAME}</span>
                              <span>{user.fullName}</span>
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userLabel}>{commonStrings.EMAIL}</span>
                              <span>{user.email}</span>
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userLabel}>{commonStrings.PHONE}</span>
                              <span>{user.phone || '-'}</span>
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userLabel}>{commonStrings.ADDRESS}</span>
                              <pre>{user.address || '-'}</pre>
                            </div>
                            <div className={styles.userInfo}>
                              <span className={styles.userLabel}>{strings.SUBSCRIBED_AT}</span>
                              <span>{Helper.capitalize(format(new Date(user.createdAt), _format, { locale: _locale }))}</span>
                            </div>
                          </div>
                          <div className={styles.userActions}>
                            <Tooltip title={strings.ORDERS}>
                              <IconButton onClick={() => {
                                router.replace(`/?u=${user._id}`)
                              }}
                              >
                                <OrdersIcon />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </article>
                      ))
                    }
                  </div>

                  {
                    (_page > 1 || _rowCount < _totalRecords) &&
                    <div className={styles.footer}>

                      <div className={styles.pager}>
                        <div className={styles.rowCount}>
                          {`${((_page - 1) * Env.PAGE_SIZE) + 1}-${_rowCount} ${commonStrings.OF} ${_totalRecords}`}
                        </div>

                        <div className={styles.actions}>

                          <Link
                            href={`/users?${`p=${_page - 1}`}${(_keyword !== '' && `&k=${encodeURIComponent(_keyword)}`) || ''}`}
                            className={_page === 1 ? styles.disabled : ''}>

                            <PreviousPageIcon className={styles.icon} />

                          </Link>

                          <Link
                            href={`/users?${`p=${_page + 1}`}${(_keyword !== '' && `&k=${encodeURIComponent(_keyword)}`) || ''}`}
                            className={_rowCount === _totalRecords ? styles.disabled : ''}>

                            <NextPageIcon className={styles.icon} />

                          </Link>
                        </div>
                      </div>

                    </div>
                  }
                </>
              }
            </div>
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
  let _user = null, _signout = false, _page = 1, _keyword = '', _totalRecords = 0, _rowCount = 0, _users = [], _noMatch = false, _language = ''

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
        _language = await SettingService.getLanguage()

        if (_user) {

          if (typeof context.query.p !== 'undefined') _page = parseInt(context.query.p)

          if (_page >= 1) {
            if (typeof context.query.s !== 'undefined') _keyword = context.query.s
            const data = await UserService.getUsers(context, _keyword, _page, Env.PAGE_SIZE)
            const _data = data[0]
            _users = _data.resultData
            _rowCount = ((_page - 1) * Env.PAGE_SIZE) + _users.length
            _totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

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
      _keyword,
      _page,
      _rowCount,
      _totalRecords,
      _users,
      _noMatch,
      _language
    }
  }
}

export default Users