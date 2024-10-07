export default {
  signup: '/api/sign-up',
  adminSignup: '/api/admin-sign-up',
  confirmEmail: '/api/confirm-email/:email/:token',
  resendLink: '/api/resend-link',
  validateEmail: '/api/validate-email',
  isAdmin: '/api/is-admin',
  isUser: '/api/is-user',
  resend: '/api/resend/:type/:email/:reset',
  activate: '/api/activate',
  checkToken: '/api/check-token/:type/:userId/:email/:token',
  deleteTokens: '/api/delete-tokens/:userId',
  signin: '/api/sign-in/:type',
  socialSignin: '/api/social-sign-in',
  validateAccessToken: '/api/validate-access-token',
  getUser: '/api/user/:id',
  update: '/api/update-user',
  updateLanguage: '/api/update-language',
  changePassword: '/api/change-password',
  getUsers: '/api/users/:page/:size/:language',
  delete: '/api/delete-users',
  checkPassword: '/api/check-password/:id/:password',
  verifyRecaptcha: '/api/verify-recaptcha/:token/:ip',
  sendEmail: '/api/send-email',
  hasPassword: '/api/has-password/:id',
  createAvatar: '/api/create-avatar',
  updateAvatar: '/api/update-avatar/:userId',
  deleteAvatar: '/api/delete-avatar/:userId',
  deleteTempAvatar: '/api/delete-temp-avatar/:avatar'
};