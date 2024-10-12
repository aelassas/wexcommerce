import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
  fr: {
    EMPTY_LIST: 'Pas de produits',
    ALL: 'Tous les produits',
    ORDER_BY_FEATURED: 'Mis en avant',
    ORDER_BY_PRICE_ASC: 'Prix croissant',
    ORDER_BY_PRICE_DESC: 'Prix décroissant',
  },
  en: {
    EMPTY_LIST: 'No products',
    ALL: 'All products',
    ORDER_BY_FEATURED: 'Featured',
    ORDER_BY_PRICE_ASC: 'Price: Low to High',
    ORDER_BY_PRICE_DESC: 'Price: High to Low',
  }
})
