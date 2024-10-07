import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
  fr: {
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: 'info@wexcommerce.com',
    COPYRIGHT: `© ${new Date().getFullYear()} wexCommerce. Tous droits réservés.`
  },
  en: {
    ADDRESS: `82 Fairground Street
    New York, NY 10031 USA`,
    PHONE: '(206) 517-7874',
    EMAIL: 'info@wexcommerce.com',
    COPYRIGHT: `© ${new Date().getFullYear()} wexCommerce. All Rights Reserved.`
  }
})
