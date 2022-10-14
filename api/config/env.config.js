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
        PAID: 'paid',
        CONFIRMED: 'confirmed',
        IN_PROGRESS: 'inProgress',
        CANCELLED: 'cancelled',
        PENDING: 'pending',
        SHIPPED: 'shipped'
    },
    PAYMENT_TYPE: {
        CREDIT_CARD: 'creditCard',
        COD: 'cod',
        WIRE_TRANSFER: 'wireTransfer'
    }
};

export default Env;