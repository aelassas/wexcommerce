export default {
    validate: '/api/validate-subscription',
    validateVideosPerMonth: '/api/validate-videos-per-month/:videosPerMonth',
    checkSubscription: '/api/check-subscription/:id',
    create: '/api/create-subscription',
    update: '/api/update-subscription/:id',
    delete: '/api/delete-subscription/:id',
    getSubscription: '/api/subscription/:id/:language',
    getSubscriptions: '/api/subscriptions/:language',
    subscribe: '/api/subscribe'
};