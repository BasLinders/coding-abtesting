// This function checks if the element is present on the page before executing the code that changes it, or elements that are related to it.
function checkAndExecute() {
    const elementToFind = jQuery(".specific-element");
    if (elementToFind.length > 0) {
        myfunction();
        clearInterval(intervalId);
    } else {
        console.log("Element not found.");
    }
}

function myfunction() {
    // do stuff you want to do on the page
}

let intervalId = setInterval(checkAndExecute, 500);
