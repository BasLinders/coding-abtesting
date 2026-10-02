/**
 * SNIPPET: Pick the right text for the visitor's language
 *
 * WHEN TO USE
 *   One test runs on several language/country versions of a site and the new copy
 *   must be shown in the right language.
 *
 * HOW IT WORKS
 *   Reads the language from <html lang="..."> first (the most reliable source),
 *   then falls back to the first URL path segment (/de/, /fr-be/).
 *
 * URLS LIKE /gb-en/ OR /de-de/?
 *   Use the recipe shared/recipes/language-from-pathname instead.
 *
 * PITFALLS
 *   - Always define a fallback. An unknown language should show sensible copy, not "undefined".
 *   - Check how the site really signals language. Some use subdomains (de.example.com)
 *     or a country selector cookie.
 *
 * WORKS WITH: all platforms
 */

const COPY = {
  en: 'View this product',
  de: 'Dieses Produkt ansehen',
  fr: 'Voir ce produit',
  es: 'Ver este producto',
  it: 'Visualizza questo prodotto'
};

function getLocale() {
  const lang = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
  if (lang) return lang;
  const segment = window.location.pathname.split('/')[1] || '';
  return segment.slice(0, 2).toLowerCase();
}

function t(copy, fallback = 'en') {
  return copy[getLocale()] || copy[fallback];
}

// Usage
const ctaText = t(COPY);
