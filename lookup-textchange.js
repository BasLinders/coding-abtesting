# Site change based on value lookup
var testBikes = setInterval(addBtns, 500);

function addBtns() {
    let bikeElements = document.querySelectorAll('.bike');

    if (bikeElements.length > 0) {
        clearInterval(testBikes);
        bikeElements.forEach((entry, index) => {
            const addBtn = document.createElement('span');

            addBtn.classList.add('bikeBtn');
            addBtn.innerHTML = 'Bekijk deze fiets';

            entry.parentElement.style.position = 'relative';
            entry.querySelector('a').append(addBtn);
        });
    }
}

// CREATE LOOKUP LANGUAGE CTA

let pageTitle = jQuery('.page-title').text().trim();
let myUrl = window.location.href;

let lookup = {
    "US": "View this bike",
    "UK": "View this bike",
    "NL": "Bekijk deze fiets",
    "FR": "Voir ce vélo",
    "IT": "Visualizza questa bicicletta",
    "DE": "Dieses Fahrrad ansehen",
    "ES": "Ver esta bicicleta"
};

function titleLookup(val) {
    // Eerste gedeeltelijke match vinden
    let result = Object.keys(lookup).find(keyword => val.includes(keyword));

    let textToMatch = lookup[result] || "View this bike";

    console.log(textToMatch);

    // Indien gevuld is dit de output
    return textToMatch;
}

function newCtaText() {
    let myUrl = window.location.href;
    let textToMatch = titleLookup(myUrl);

    // Check of URL een key uit de lookup bevat
    if (Object.keys(lookup).some(key => myUrl.includes(key))) {
        jQuery('.bikeBtn').text(textToMatch);
    }
}

jQuery(document).ready(function () {
    newCtaText();
});