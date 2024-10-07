export default {
    validate: '/api/validate-category',
    checkCategory: '/api/check-category/:id',
    create: '/api/create-category',
    update: '/api/update-category/:id',
    delete: '/api/delete-category/:id',
    getCategory: '/api/category/:id/:language',
    getCategories: '/api/categories/:language',
    searchCategories: '/api/search-categories/:language',
    createImage: '/api/create-category-image',
    updateImage: '/api/update-category-image/:id',
    deleteImage: '/api/delete-category-image/:id',
    deleteTempImage: '/api/delete-temp-category-image/:image',
}
