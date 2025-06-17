export default {
    checkout: '/api/checkout',
    update: '/api/update-order/:user/:id',
    delete: '/api/delete-order/:user/:id',
    deleteTempOrder: '/api/delete-temp-order/:orderId/:sessionId',
    getOrder: '/api/order/:id',
    getOrders: '/api/orders/:user/:page/:size',
}
