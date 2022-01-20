context {
    // input parameters (provided outside)
    // phone to call
    input phone: string;
    
    // output parameters (will be set during the dialogue)
    success: boolean = false;
}


start node root {
    do {
        #connectSafe($phone);
        // waiting until user says something
        #waitForSpeech(2000)
        goto greeting;
    }
    transitions {
        greeting: goto greeting;
    }
}

node greeting {
    do {
        #sayText("Hello!");
        wait*;
    }
    transitions {
        goodbye: goto goodbye on true;
    }
}

node goodbye {
    do {
        #sayText("Goodbye!");
        // set output variable
        set $success = true;
        // explicitly exit the dialogue
        exit;
    }
}

// this digression is handler for event when user hangs up
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}
