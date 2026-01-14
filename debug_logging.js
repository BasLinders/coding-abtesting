/* --------------------- DEBUGGING ------------------------------*/
const debug = {
    isEnabled: true,
    msg_intro: "AB-TESTING",
    msg: "shorten_price",
    styles: {
        intro: "color: #fff; background: #0077b6; padding: 2px 5px; border-radius: 3px; font-weight: bold;",
        tag: "color: #000; background: #caf0f8; padding: 2px 5px; font-weight: bold;",
        text: "color: #03045e;"
    }
};

function logDebugMessage(...args) {
    if (debug.isEnabled) {
        const primaryMessage = args[0];
        const extraArgs = args.slice(1);

        console.log(`%c${debug.msg_intro}%c[${debug.msg}]: %c${primaryMessage}`,
            debug.introStyle,
            debug.msgStyle,
            debug.messageStyle,
            ...extraArgs
        );
    }
}

// Voorbeelden om te loggen (verschillende stijlen)
logDebugMessage("Starting experiment."); // Standaardbericht
logDebugMessage("Error: Couldn't execute change.", "color: red;"); // Foutmelding
logDebugMessage("Warning: Change executed twice.", "color: orange;"); // Waarschuwing
logDebugMessage("Success: Change executed!", "color: green; font-style: italic;"); // Succes
