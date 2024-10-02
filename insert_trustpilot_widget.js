// Create the async script element and insert in head
const scriptElement = document.createElement('script');
scriptElement.async = true;
scriptElement.src = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
document.head.appendChild(scriptElement);

// Create the Trustpilot widget
const myReviews = 
`
<div id="trustpilot_box" class="trustpilot-widget" data-locale="nl-NL" data-template-id="[YOUR ID]" data-businessunit-id="[YOUR BU ID]" data-style-height="20px" data-style-width="100%" data-theme="light">
	<a href="https://nl.trustpilot.com/review/www.woonexpress.nl" target="_blank" rel="noopener">Trustpilot</a>
</div>
`;

const reviewsElement = document.createElement('div');
reviewsElement.innerHTML = myReviews;

// Insert the widget
const targetElement = document.querySelector('#payment-methods'); // target element
if (targetElement) {
	targetElement.insertAdjacentElement('afterend', reviewsElement); // Insert after target element
} else {
	console.error('Target element not found.');
}

let trustpilotBox = document.getElementById('trustpilot_box');
window.Trustpilot.loadFromElement(trustpilotBox); // Load trustpilot element explicitly
