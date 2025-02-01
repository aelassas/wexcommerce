import LocalizedStrings from 'localized-strings'
import env from '@/config/env.config'

export const strings = new LocalizedStrings({
  fr: {
    CORPORATE: 'À Propos',
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: env.CONTACT_EMAIL,
    COPYRIGHT: `© ${new Date().getFullYear()} ${env.WEBSITE_NAME}. Tous droits réservés.`
  },
  en: {
    CORPORATE: 'Corporate',
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: env.CONTACT_EMAIL,
    COPYRIGHT: `© ${new Date().getFullYear()} ${env.WEBSITE_NAME}. All Rights Reserved.`
  }
})
