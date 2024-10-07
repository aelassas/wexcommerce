import { I18n } from 'i18n-js';
import { en } from "./en.js";
import { fr } from "./fr.js";
const i18n = new I18n({
  en,
  fr
});
i18n.enableFallback = true;
export default i18n;