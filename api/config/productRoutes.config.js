export default {
    uploadImage: '/api/upload-image',
    deleteTempImage: '/api/delete-temp-image/:fileName',
    create: '/api/create-product',
    update: '/api/update-product',
    checkProduct: '/api/check-product/:id',
    delete: '/api/delete-product/:id',
    getProduct: '/api/product/:id',
    getBackendProducts: '/api/backend-products/:user/:page/:size/:category?',
    getFrontendProducts: '/api/frontend-products/:page/:size/:category?',
};