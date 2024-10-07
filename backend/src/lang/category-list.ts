import LocalizedStrings from 'react-localization'

export const strings = new LocalizedStrings({
    fr: {
        EMPTY_LIST: 'Pas de catégories',
        DELETE_CATEGORY: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
        CANNOT_DELETE_CATEGORY: 'Cette catégorie ne peut pas être supprimée car elle est liée à des produits.',
    },
    en: {
        EMPTY_LIST: 'No categories',
        DELETE_CATEGORY: 'Are you sure you want to delete this category?',
        CANNOT_DELETE_CATEGORY: 'This category cannot be deleted because it is related to products.',
    }
})
