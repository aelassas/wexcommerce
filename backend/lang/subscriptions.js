import LocalizedStrings from 'react-localization';

export const strings = new LocalizedStrings({
    fr: {
        NEW_SUBSCRIPTION: 'Nouvel Abonnement',
        EMPTY_LIST: "Pas d'abonnement",
        DELETE_SUBSCRIPTION: 'Êtes-vous sûr de vouloir supprimer cet abonnement ?',
        CANNOT_DELETE_SUBSCRIPTION: 'Cet abonnement ne peut pas être supprimé car il est lié à des utilisateurs.',
        VIDEOS_PER_MONTH: 'Vidéos/mois',
        PRICE: 'Prix'
    },
    en: {
        NEW_SUBSCRIPTION: 'New Subscription',
        EMPTY_LIST: 'No subscriptions',
        DELETE_SUBSCRIPTION: 'Are you sure you want to delete this subscription?',
        CANNOT_DELETE_SUBSCRIPTION: 'This subscription cannot be deleted because it is related to users.',
        VIDEOS_PER_MONTH: 'Videos/month',
        PRICE: 'Price'
    }
});

