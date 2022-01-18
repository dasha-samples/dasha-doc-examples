context {
    // input parameters (provided outside)
    // phone to call
    input phone: string;

    // output parameters (will be set during the dialogue)
    // parsed user estimation converted to a number
    output estimation: number?;
    // parsed user feedback
    output feedback: string?;
}


start node root {
    do {
        #connectSafe($phone);
        // waiting until user says something
        // if nothing happens during 2000 ms, force-start the dialog
        if (#waitForSpeech(2000)) {
            // if speech was detected, wait until any transition can be executed
            wait * ;
        }
        else {
            // immediate unconditional transition 
            goto force_greeting;
        }
    }
    transitions {
        // greeting transition will be executed after calling 'wait*' 
        // and after the system gets any user input
        greeting: goto greeting on true;
        // force_greeting transition will be executer only if it was called in 'do' section
        force_greeting: goto greeting;
    }
}

node greeting {
    do {
        #sayText("Hi, this is delivery service quality control department.");
        #sayText("How would you evaluate our service?");
        // now user asked to evaluate our delivery service

        // wait until any transition can be executed
        // it could be transition 'got_estimation' or digression 'dont_understand'
        wait*;
    }
    transitions {
        // this transition can be executed if 'estimation' entity is parsed from user input 
        got_estimation: goto get_feedback on #messageHasData("estimation");
    }
}

node get_feedback {
    do {
        // convert first parsed user estimation to number
        set $estimation = #messageGetData("estimation")[0]?.value?.parseNumber();
        // threshold of good estimation is 4
        if ($estimation is not null && $estimation >= 4) {
            set $feedback = "[good] ";
            #sayText("What did you like about our service?");
        } else {
            set $feedback = "[bad] ";
            #sayText("What was wrong about our service?");
        }
        wait*;
    }
    transitions {
        // go to the last node on any user input (that will be interpreted as feedback)
        goodbye: goto goodbye on true;
    }
}

node goodbye {
    do {
        // if entity 'service' was parsed
        if (#messageHasData("service")) {
            var services: string?[] = [];
            // go through the parsed services and add them to buffer
            for (var s in #messageGetData("service")) {
                services.push(s.value);
            }
            // add all parsed services and raw text to feedback
            set $feedback = services.join(",") + ": " + #getMessageText();
        } else {
            // add raw text to feedback
            set $feedback = "other: " + #getMessageText();
        }
        #sayText("Thank you for your attention. Bye!");
        // exit from dialog
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
        exit;
    }
}