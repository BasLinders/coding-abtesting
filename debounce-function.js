function debounce(func, delay) {
    let timeoutId;

    return function(...args) {
        // Clear the previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Set a new timeout
        timeoutId = setTimeout(() => {
            func.apply(this, args); // Call the original function with the correct context and arguments
        }, delay);
    };
}

// Example function to be debounced
function handleResize() {
    console.log('Window resized!', window.innerWidth, window.innerHeight);
}

// Create a debounced version of the handleResize function
const debouncedResize = debounce(handleResize, 300); // 300 milliseconds delay

// Attach the debounced function to the window resize event
window.addEventListener('resize', debouncedResize);
