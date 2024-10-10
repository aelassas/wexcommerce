export enum UserType {
  Admin = 'admin',
  User = 'user',
}

export enum AppType {
  Backend = 'backend',
  Frontend = 'frontend',
}

export enum OrderStatus {
  Pending = 'pending',
  Paid = 'paid',
  Confirmed = 'confirmed',
  InProgress = 'inProgress',
  Shipped = 'shipped',
  Cancelled = 'cancelled',
}

export enum PaymentType {
  CreditCard = 'creditCard',
  Cod = 'cod',
  WireTransfer = 'wireTransfer',
}

export enum DeliveryType {
  Shipping = 'shipping',
  Withdrawal = 'withdrawal',
}

export interface SignUpPayload {
  email: string
  fullName: string
  password: string
  phone?: string
  address?: string
  active?: boolean
  verified?: boolean
  verifiedAt?: Date
  language: string
  type?: UserType
  blacklisted?: boolean
  customerId?: string
  avatar?: string
}

export interface ResendLinkPayload {
  email?: string
}

export interface ValidateEmailPayload {
  email: string
}

export interface IsAdminPayload {
  email: string
}

export interface IsUserPayload {
  email: string
}

export interface ActivatePayload {
  userId: string
  token: string
  password: string
}

export enum SocialSignInType {
  Facebook = 'facebook',
  Apple = 'apple',
  Google = 'google'
}

export interface SignInPayload {
  email?: string
  password?: string
  stayConnected?: boolean
  mobile?: boolean
  fullName?: string
  avatar?: string
  accessToken?: string
  socialSignInType?: SocialSignInType
}

export interface User {
  _id?: string
  fullName: string
  email?: string
  phone?: string
  password?: string
  verified?: boolean
  verifiedAt?: Date
  active?: boolean
  language?: string
  avatar?: string
  address?: string
  type?: string
  blacklisted?: boolean
  accessToken?: string
  checked?: boolean
  customerId?: string
  createdAt?: Date
}

export interface UpdateUserPayload {
  _id: string
  fullName: string
  phone: string
  address: string
}

export interface UpdateLanguagePayload {
  id: string
  language: string
}

export interface ChangePasswordPayload {
  _id: string
  password: string
  newPassword: string
  strict: boolean
}

export interface SendEmailPayload {
  from: string
  to: string
  subject: string
  message: string
  recaptchaToken: string
  ip: string
}

export interface DeliveryTypeInfo {
  _id: string
  name: DeliveryType
  enabled: boolean
  price: number | string
}

export type UpdateDeliveryTypesPayload = DeliveryTypeInfo[]

export interface PaymentTypeInfo {
  _id: string
  name: PaymentType
  enabled: boolean
}

export type UpdatePaymentTypesPayload = PaymentTypeInfo[]

export interface AddItemPayload {
  cartId: string
  userId: string
  productId: string
}

export interface AddWishlistItemPayload {
  wishlistId: string
  userId: string
  productId: string
}

export interface Wishlist {
  _id: string
  products: Product[]
}

export interface UpdateSettingsPayload {
  language: string
  currency: string
  stripeCurrency: string
}

export interface UpdateBankSettingsPayload {
  bankName?: string
  accountHolder?: string
  rib?: string
  iban?: string
}

export interface ValidateCategoryPayload {
  language: string
  value: string
}

export interface Value {
  language: string
  value: string
}

export interface UpsertCategoryPayload {
  values: Value[]
  image?: string
  featured: boolean
}

export interface CreateProductPayload {
  name: string
  description: string
  categories: string[]
  image?: string
  images: string[]
  price: number
  quantity: number
  soldOut: boolean
  hidden: boolean
  featured: boolean
}

export interface UpdateProductPayload extends CreateProductPayload {
  _id: string
  tempImages: string[]
}

export interface OrderItem {
  _id?: string
  product: Product | string
  quantity: number
}

export interface OrderInfo {
  _id?: string
  user?: string | User
  deliveryType: DeliveryTypeInfo | string
  paymentType: PaymentTypeInfo | string
  total: number
  status?: OrderStatus
  orderItems?: string[] | OrderItem[]
  sessionId?: string
  paymentIntentId?: string
  customerId?: string
  expireAt?: Date
  createdAt?: Date
}

export interface CheckoutPayload {
  user?: User
  order: OrderInfo
  paymentIntentId?: string
  sessionId?: string
  customerId?: string
}

export interface UpdateOrderPayload {
  status: OrderStatus
}

export interface GetOrdersPayload {
  paymentTypes: PaymentType[]
  deliveryTypes: DeliveryType[]
  statuses: OrderStatus[]
  from: number | null
  to: number | null
}

export interface CreatePaymentPayload {
  amount: number
  /**
   * Three-letter ISO currency code, in lowercase.
   * Must be a supported currency: https://docs.stripe.com/currencies
   *
   * @type {string}
   */
  currency: string
  /**
   * The IETF language tag of the locale Checkout is displayed in. If blank or auto, the browser's locale is used.
   *
   * @type {string}
   */
  locale: string
  receiptEmail: string
  customerName: string
  name: string
  description?: string
}

export interface PaymentResult {
  sessionId?: string
  paymentIntentId?: string
  customerId: string
  clientSecret: string | null
}

export interface CategoryInfo {
  _id: string
  name: string
  values?: Value[]
  image?: string
  featured: boolean
}

export interface ResultData<T> {
  pageInfo: [{ totalRecords: number }]
  resultData: T[]
}

export type Result<T> = [ResultData<T>] | [] | undefined | null

export interface Notification {
  _id: string
  user: string
  message: string
  booking?: string
  isRead?: boolean
  checked?: boolean
  createdAt?: Date
  order?: string
}

export interface NotificationCounter {
  _id: string
  user: string
  count: number
}

export interface Setting {
  _id: string
  language: string
  currency: string
  stripeCurrency: string
  bankName?: string
  accountHolder?: string
  rib?: string
  iban?: string
}

export interface Product {
  _id: string
  name: string
  description: string
  categories: string[] | CategoryInfo[]
  image?: string
  images?: string[]
  price: number
  quantity: number
  soldOut: boolean
  hidden: boolean
  inCart?: boolean
  inWishlist?: boolean
  featured: boolean
}

export interface Option {
  _id: string
  name?: string
  image?: string
}

export interface Response<T> {
  status: number
  data: T
}

export interface Cart {
  _id: string
  user: string
  cartItems: CartItem[]
}

export interface CartItem {
  _id: string
  product: Product
  quantity: number
}

export interface GetProductPayload {
  cart?: string
  wishlist?: string
}

export interface GetProductsPayload {
  cart?: string
  wishlist?: string
  size?: number
}

export interface FeaturedCategory {
  category: CategoryInfo
  products: Product[]
}
