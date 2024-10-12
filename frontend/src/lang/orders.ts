import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Pas de commmandes',
    ID: 'ID',
    STATUS: 'Statut',
    PAYMENT_TYPE: 'Mode de paiement',
    DELIVERY_TYPE: 'Mode de livraison',
    CLIENT: 'Client',
    ORDER_ITEMS: 'Articles',
    PRODUCT: 'Article',
    ORDERED_AT: 'Effectuée le',
    TOTAL: 'Total',
    ORDER_BY_DATE_DESC: 'Date (décroissant)',
    ORDER_BY_DATE_ASC: 'Date (croissant)',
  },
  en: {
    EMPTY_LIST: 'No orders',
    ID: 'ID',
    STATUS: 'Status',
    PAYMENT_TYPE: 'Payment method',
    DELIVERY_TYPE: 'Delivery method',
    CLIENT: 'Customer',
    ORDER_ITEMS: 'Items',
    PRODUCT: 'Item',
    ORDERED_AT: 'Ordered at',
    TOTAL: 'Total',
    ORDER_BY_DATE_DESC: 'Date Descending',
    ORDER_BY_DATE_ASC: 'Date Ascending',
  }
})
