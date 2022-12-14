import LocalizedStrings from 'react-localization';

export const strings = new LocalizedStrings({
    fr: {
        ADDRESS_1: 'wexCommerce',
        ADDRESS_2: 'Adresse...',
        ADDRESS_3: '20000 Casablanca, Maroc',
        PHONE: '00212 6 00 00 00 00',
        EMAIL: 'contact@anson.com',
        COPYRIGHT: `© ${new Date().getFullYear()} wexCommerce. Tous droits réservés.`
    },
    en: {
        ADDRESS_1: 'wexCommerce',
        ADDRESS_2: 'Address...',
        ADDRESS_3: '20000 Casablanca, Morocco',
        PHONE: '00212 6 00 00 00 00',
        EMAIL: 'contact@anson.com',
        COPYRIGHT: `© ${new Date().getFullYear()} wexCommerce. All Rights Reserved.`
    }
});