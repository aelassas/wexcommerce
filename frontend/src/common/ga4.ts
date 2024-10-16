import ga4 from 'react-ga4'
import env from '@/config/env.config'

const TRACKING_ID = env.GOOGLE_ANALYTICS_ID

export const init = () => ga4.initialize(TRACKING_ID, {
  testMode: !env.isProduction()
})

export const sendEvent = (name: string) => ga4.event('screen_view', {
  app_name: 'wexCommerce',
  screen_name: name,
})

export const sendPageview = (path: string) => ga4.send({
  hitType: 'pageview',
  page: path
})
