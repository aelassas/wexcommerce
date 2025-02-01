import LocalizedStrings from 'localized-strings'
import env from '@/config/env.config'

export const strings = new LocalizedStrings({
  fr: {
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: 'info@wexcommerce.com',
    COPYRIGHT: `© ${new Date().getFullYear()} ${env.WEBSITE_NAME}. Tous droits réservés.`
  },
  en: {
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: 'info@wexcommerce.com',
    COPYRIGHT: `© ${new Date().getFullYear()} ${env.WEBSITE_NAME}. All Rights Reserved.`
  }
})
