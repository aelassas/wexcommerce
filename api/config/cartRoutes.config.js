export default {
    addItem: '/api/add-cart-item',
    updateItem: '/api/update-cart-item/:cartItem/:quantity',
    deleteItem: '/api/delete-cart-item/:cart/:product',
    delete: '/api/delete-cart/:id',
    getCart: '/api/cart/:id',
    getCartCount: '/api/cart-count/:id',
    getCartId: '/api/cart-id/:user',
    update: '/api/update-cart/:id/:user'
}