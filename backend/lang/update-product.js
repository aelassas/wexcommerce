import LocalizedStrings from 'react-localization';

export const strings = new LocalizedStrings({
    fr: {
        PRODUCT_UPDATED: 'Produit modifié avec succès.',
        DELETE_PRODUCT: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
        CANNOT_DELETE_PRODUCT: 'Ce produit ne peut pas être supprimé car il est lié à des commandes. Vous pouvez cependant le cacher.',
        DESCRIPTION_REQUIRED: 'Veuillez saisir une description.'
    },
    en: {
        PRODUCT_UPDATED: 'Product updated successfully.',
        DELETE_PRODUCT: 'Are you sure you want to delete this product?',
        CANNOT_DELETE_PRODUCT: 'This product cannot be deleted because it is related to orders. However, you can hide it.',
        DESCRIPTION_REQUIRED: 'Please add a description.'
    }
});

