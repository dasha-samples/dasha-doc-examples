context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;

    // output parameters (will be set during the dialogue)
    output status: string = "None";
}


start node root {
    do {
        #connectSafe($endpoint);
        wait * ;
    }
    transitions {
        // if answering_machine is not triggered, then start the dialogue
        greeting: goto greeting on !#messageHasIntent("answering_machine") priority 10;
        // otherwise, handle voicemail answer
        voice_mail: goto voice_mail on #messageHasIntent("answering_machine");
    }
}

node greeting {
    do {
        set $status = "Done";
        #sayText("Hi! Seems like you are alive human.");
        #sayText("What is your name?");
        wait*;
    }
    transitions {
        goodbye: goto goodbye on true;
    }
}

node goodbye {
    do {
        var name = #getMessageText();
        #sayText("Pleasure to meet you, " + name + "! Bye!");
    }
}

node voice_mail {
    do {
        set $status = "Voice mail";
        exit;
    }
}

// this digression is visited if no other transition can be executed
digression dont_understand {
    conditions {
        // set low priority to avoid triggering on any other transitions
        on true priority -100;
    }
    do {
        #log("digression 'dont_understand'");
        // say phrase that will no be repeated 
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        // repeat last phrase without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
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
