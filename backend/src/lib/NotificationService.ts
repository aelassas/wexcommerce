'use server'

import * as wexcommerceTypes from ':wexcommerce-types'
import * as fetchInstance from './fetchInstance'
import env from '@/config/env.config'
import * as UserService from './UserService'

/**
 * Get NotificationCounter by UserID.
 *
 * @param {string} userId
 * @returns {Promise<wexcommerceTypes.NotificationCounter>}
 */
export const getNotificationCounter = async (userId: string): Promise<wexcommerceTypes.NotificationCounter> => (
  fetchInstance
    .GET(
      `/api/notification-counter/${encodeURIComponent(userId)}`,
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
)

/**
 * Mark Notifications as read.
 *
 * @param {string} userId
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const markAsRead = async (userId: string, ids: string[]): Promise<number> => (
  fetchInstance
    .POST(
      `/api/mark-notifications-as-read/${encodeURIComponent(userId)}`,
      { ids },
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Mark Notifications as unread.
 *
 * @param {string} userId
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const markAsUnread = async (userId: string, ids: string[]): Promise<number> => (
  fetchInstance
    .POST(
      `/api/mark-notifications-as-unread/${encodeURIComponent(userId)}`,
      { ids },
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Delete Notifications.
 *
 * @param {string} userId
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const deleteNotifications = async (userId: string, ids: string[]): Promise<number> => (
  fetchInstance
    .POST(
      `/api/delete-notifications/${encodeURIComponent(userId)}`,
      { ids },
      [await UserService.authHeader()],
      true
    )
    .then((res) => res.status)
)

/**
 * Get Notifications.
 *
 * @param {string} userId
 * @param {number} page
 * @returns {Promise<wexcommerceTypes.Result<wexcommerceTypes.Notification>>}
 */
export const getNotifications = async (userId: string, page: number): Promise<wexcommerceTypes.Result<wexcommerceTypes.Notification>> => (
  fetchInstance
    .GET(
      `/api/notifications/${encodeURIComponent(userId)}/${page}/${env.PAGE_SIZE}`,
      [await UserService.authHeader()]
    )
    .then((res) => res.data)
)
