/* --------------------- DEBUGGING ------------------------------*/
const debug = {
    introStyle: "color: #fff; font-size: 14px; background: red; padding: 2px 5px; border-radius: 3px;", // Stijl voor msg_intro
    msgStyle: "color: #ccc; font-size: 12px; background: none; padding: 2px 5px;", // Style voor msg
    messageStyle: "color: #fff; font-weight: bold;", // Basisstijl voor de inhoud van het bericht
    msg_intro: "DEBUGGING",
    msg: "experiment_id",
    isEnabled: true // of 'false' als de logs uit moeten worden geschakeld, voor de livegang van de test
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
