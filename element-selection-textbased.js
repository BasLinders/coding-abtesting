myUrl = window.location.href;

function getElementsByTextContent(text) {
    const xpath = "//*[contains(text(), '" + text + "')]";
    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const matchingElements = [];

    for (let i = 0; i < result.snapshotLength; i++) {
        matchingElements.push(result.snapshotItem(i));
    }

    return matchingElements;
}

const elementVerzending = getElementsByTextContent('Verzending');
const elementVerzendKostenParent = getParentByTextContent('Nog niet berekend');
const parentOfElementVerzendKostenParent = getParent(elementVerzendKostenParent);

console.log(elementVerzending);
console.log(elementVerzendKostenParent);
console.log(parentOfElementVerzendKostenParent);

function alterElementCss(element, cssProperties) {
    if (element) {
        for (const property in cssProperties) {
            if (cssProperties.hasOwnProperty(property)) {
                element.style[property] = cssProperties[property];
            }
        }
    }
}

const cssChanges = {
    display: 'none'
};

if (myUrl === 'https://www.hulpmiddelwereld.nl/cart') {
    alterElementCss(elementVerzending[0], cssChanges);
    alterElementCss(elementVerzendKostenParent, cssChanges);
    alterElementCss(parentOfElementVerzendKostenParent, cssChanges);
}

function getParentByTextContent(text) {
    const xpath = "//*[contains(text(), '" + text + "')]/..";
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

    return result.singleNodeValue;
}

function getParent(element) {
    return element ? element.parentNode : null;
}