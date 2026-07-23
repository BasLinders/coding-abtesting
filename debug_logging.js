/* --------------------- DEBUGGING ------------------------------*/
const debug = {
    isEnabled: true,
    styles: {
        intro: "color: #fff; background: #0077b6; padding: 2px 5px; border-radius: 3px; font-weight: bold;",
        tag: "color: #000; background: #caf0f8; padding: 2px 5px; font-weight: bold;",
        text: "color: #fff;"
    }
};

function log(msg, ...args) {
    if (debug.isEnabled) {
        console.log(`%cAB-TEST%c[name]: %c${msg}`, 
            debug.styles.intro, debug.styles.tag, debug.styles.text, ...args);
    }
}
