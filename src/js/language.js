document.addEventListener("DOMContentLoaded", function () {
   // Function to update text based on "data-manifest"
   let textElements = document.querySelectorAll('[data-manifest]');

   for (let element of textElements) {
       if (typeof Manifest !== 'undefined' && Manifest[element.dataset.manifest]) {
           element.textContent = Manifest[element.dataset.manifest];
       } else {
           console.error(`Manifest entry for ${element.dataset.manifest} not found.`);
       }
   }

   // Function to update text based on "data-i18n" for i18n translations
   textElements = document.querySelectorAll('[data-i18n]');

   for (let element of textElements) {
       let message = browser.i18n.getMessage(element.dataset.i18n);

       if (message) {
           element.textContent = message;
       } else {
           console.error(`Translation key for ${element.dataset.i18n} not found.`);
       }
   }
});
