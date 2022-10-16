export default {
    uploadImage: '/api/upload-image',
    deleteTempImage: '/api/delete-temp-image/:fileName',
    create: '/api/create-product',
    update: '/api/update-product',
    delete: '/api/delete-product/:id',
    getProduct: '/api/product/:id/:language',
    getBackendProducts: '/api/backend-products/:user/:page/:size/:category?',
    getFrontendProducts: '/api/frontend-products/:page/:size/:category?',
};