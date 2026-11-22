/* Preview routes and QR/share never direct users to production. */
window.MOHW_CONFIG={...(window.MOHW_CONFIG||{}),canonicalUrl:new URL('./',location.href).href};
