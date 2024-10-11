export var UserType;
(function (UserType) {
    UserType["Admin"] = "admin";
    UserType["User"] = "user";
})(UserType || (UserType = {}));
export var AppType;
(function (AppType) {
    AppType["Backend"] = "backend";
    AppType["Frontend"] = "frontend";
})(AppType || (AppType = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Pending"] = "pending";
    OrderStatus["Paid"] = "paid";
    OrderStatus["Confirmed"] = "confirmed";
    OrderStatus["InProgress"] = "inProgress";
    OrderStatus["Shipped"] = "shipped";
    OrderStatus["Cancelled"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
export var PaymentType;
(function (PaymentType) {
    PaymentType["CreditCard"] = "creditCard";
    PaymentType["Cod"] = "cod";
    PaymentType["WireTransfer"] = "wireTransfer";
})(PaymentType || (PaymentType = {}));
export var DeliveryType;
(function (DeliveryType) {
    DeliveryType["Shipping"] = "shipping";
    DeliveryType["Withdrawal"] = "withdrawal";
})(DeliveryType || (DeliveryType = {}));
export var SocialSignInType;
(function (SocialSignInType) {
    SocialSignInType["Facebook"] = "facebook";
    SocialSignInType["Apple"] = "apple";
    SocialSignInType["Google"] = "google";
})(SocialSignInType || (SocialSignInType = {}));
export var ProductOrderBy;
(function (ProductOrderBy) {
    ProductOrderBy["featured"] = "featured";
    ProductOrderBy["priceAsc"] = "priceAsc";
    ProductOrderBy["priceDesc"] = "priceDesc";
})(ProductOrderBy || (ProductOrderBy = {}));
