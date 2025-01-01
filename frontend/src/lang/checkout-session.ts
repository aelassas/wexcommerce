import LocalizedStrings from 'localized-strings'

export const strings = new LocalizedStrings({
  fr: {
    CHECKING: 'Vérification en cours...',
    SUCCESS: 'Votre paiement a été effectué avec succès. Nous vous avons envoyé un e-mail de confirmation.',
    PAYMENT_FAILED: 'Paiement échoué.',
  },
  en: {
    CHECKING: 'Checking in progress...',
    SUCCESS: 'Your payment was successfully done. We sent you a confirmation email.',
    PAYMENT_FAILED: 'Payment failed.',
  }
})
