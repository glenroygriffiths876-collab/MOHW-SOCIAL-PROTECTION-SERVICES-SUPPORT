/* Preview links must refer to this independent preview deployment, never the production website. */
window.MOHW_CONFIG = Object.assign({}, window.MOHW_CONFIG || {}, { canonicalUrl: new URL('./', location.href).href });
