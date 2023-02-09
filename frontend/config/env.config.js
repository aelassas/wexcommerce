
const Env = {
    isMobile: () => window.innerWidth <= 960,
    isTablet: () => window.innerWidth >= 500 && window.innerWidth <= 960,
    isLandscape: () => window.innerHeight <= 566,

    APP_TYPE: process.env.NEXT_PUBLIC_WC_APP_TYPE || 'frontend',
    API_HOST: process.env.NEXT_PUBLIC_WC_API_HOST,
    LANGUAGE_FR: 'fr',
    LANGUAGE_EN: 'en',
    LANGUAGES: ['fr', 'en'],
    _LANGUAGES: [
        {
            code: 'fr',
            label: 'Français'
        },
        {
            code: 'en',
            label: 'English'
        }
    ],
    DEFAULT_LANGUAGE: process.env.NEXT_PUBLIC_WC_DEFAULT_LANGUAGE || 'en',
    PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_WC_PAGE_SIZE || 30),
    CDN_PRODUCTS: process.env.NEXT_PUBLIC_WC_CDN_PRODUCTS,
    CDN_TEMP_PRODUCTS: process.env.NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS,
    USER_TYPE: {
        ADMIN: 'admin',
        USER: 'user'
    },
    PAYMENT_TYPE: {
        CREDIT_CARD: 'creditCard',
        COD: 'cod',
        WIRE_TRANSFER: 'wireTransfer'
    },
    DELIVERY_TYPE: {
        SHIPPING: 'shipping',
        WITHDRAWAL: 'withdrawal'
    },
    ORDER_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        CONFIRMED: 'confirmed',
        IN_PROGRESS: 'inProgress',
        SHIPPED: 'shipped',
        CANCELLED: 'cancelled'
    },
    COOCKIES_OPTIONS: { maxAge: 100 * 365 * 24 * 60 * 60 },
}

export default Env