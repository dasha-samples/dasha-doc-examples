context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    input max_num_interrupts: number = 5;

    // output parameters (will be set during the dialogue)
    output status: string = "None";
    output num_interrupts: number = 0;
}


start node root {
    do {
        #connectSafe($endpoint);
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
        #log("node 'greeting'");
        #sayText("Hi! Are you ready to test interrupting hangup?");
        wait*;
    }
    transitions {
        goodbye: goto goodbye on #messageHasSentiment("positive");
    }
}

node goodbye {
    do {
        #log("node 'goodbye'");
        /** interrupts can be caused by intents during Dasha utterance */
        var is_completely_said = #sayText(
            "Now I'm going to wait for 5 seconds before hangup. " + 
            "You may say something like 'no' or 'wait' to prevent the exiting dialogue. " + 
            "Now I say goodbye to you. Have a nice day! Bye!", 
            interruptible: true,
            options: { interruptConditions: ["no", "not_interested", "wait", "can_you_hear_me"] }
        );
        set $status = "Done";
        if (!is_completely_said) {
            goto interrupt_hangup;
        }
        /** the other way to implement interrupts before hangup is to set timer before exiting dialogue */
        goto wait_for_interrupt_or_hangup;
    }
    transitions {
        interrupt_hangup: goto interrupt_hangup;
        wait_for_interrupt_or_hangup: goto wait_for_interrupt_or_hangup;
    }
}

node wait_for_interrupt_or_hangup {
    do {
        #log("node 'wait_for_interrupt_or_hangup'");
        wait*;
    }
    transitions {
        // wait 2 seconds before hangup
        wait_timeout: goto hangup on timeout 5000;
        // if timer is not finished and user agrees with hangup, then end dialogue immediately
        ok_bye: goto hangup on #messageHasAnyIntent(["bye", "thank_you"]);

        // if timer is not finished and user wants to return in the dialogue, go to some node
        interrupt1: goto interrupt_hangup on #messageHasSentiment("negative");
        interrupt2: goto interrupt_hangup on #messageHasAnyIntent(["no", "not_interested", "wait", "can_you_hear_me"]);
    }
}

node interrupt_hangup {
    do {
        #log("node 'interrupt_hangup'");
        set $num_interrupts += 1;
        #sayText("Ok, hangup is interrupted");

        // avoid endless loops in dialogue
        if ($num_interrupts >= $max_num_interrupts) {
            set $status = "Hangup interrupt count limit exceeded";
            #sayText("We reached " + $num_interrupts.toString() + " interrupts which is maximum number. Bye!");
            goto hangup;
        }
        // in current example we simply return to the last node
        goto goodbye;
    }
    transitions {
        hangup: goto hangup;
        goodbye: goto goodbye;
    }
}

node hangup {
    do {
        #log("node 'hangup'");
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
