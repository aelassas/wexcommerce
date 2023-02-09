const Env = {
    DEFAULT_LANGUAGE: 'fr',
    USER_TYPE: {
        ADMIN: 'admin',
        USER: 'user'
    },
    APP_TYPE: {
        BACKEND: 'backend',
        FRONTEND: 'frontend'
    },
    ORDER_STATUS: {
        PENDING: 'pending',
        PAID: 'paid',
        CONFIRMED: 'confirmed',
        IN_PROGRESS: 'inProgress',
        SHIPPED: 'shipped',
        CANCELLED: 'cancelled'
    },
    PAYMENT_TYPE: {
        CREDIT_CARD: 'creditCard',
        COD: 'cod',
        WIRE_TRANSFER: 'wireTransfer'
    },
    DELIVERY_TYPE: {
        SHIPPING: 'shipping',
        WITHDRAWAL: 'withdrawal'
    }
}

export default Env