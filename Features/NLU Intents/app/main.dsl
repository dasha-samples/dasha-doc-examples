/**

This demo mostly uses [digressions](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression) 
    since the logic of the script assume that user asks questions and requests us about something.

After the initiating the call in `root` and asking the user in `greeting` the dialog waits in node `main_hub`.
This node is made just for waiting for any triggers and returning back here after the trigger is handled.

The triggers are implemented with digressions (`what_services`, `order_food`, `check_out_info`, `need_cleaning`, `goodbye`) 
    and corresponding intents that are specified in `data.json`. 
Note that intent `"bye"` is the system intent. It is available due to enabling skill "common_phrases" in `.dashaapp`.

Every digression contains phrases that are said to the user and after they are done, dialog returns to the further listening. 
Except for `goodbye` - this digression is used as a trigger for exiting dialog.

*/

context {
    // input parameters (provided outside)
    // phone to call
    input phone: string;

    // output parameters (will be set during the dialogue)
    // all these vars are set to true if user asked about them
    output askedFood: boolean = false;
    output askedCleaning: boolean = false;
    output askedCheckOutInfo: boolean = false;
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
        #log("node 'greeting'");
        #sayText("Hello, this is the hotel reception.");
        #sayText("Is there anything I can do for you?");
        // unconditional transition to hub
        goto next;
    }
    transitions {
        next: goto main_hub;
    }
}

node main_hub {
    do {
        #log("node 'hub'");
        // wait until user asks a question or says that he (don't) needs anything
        wait*;
    }
    transitions {
        // specify the question
        yes: goto what_do_you_need on #messageHasIntent("agreement", "positive");
        // if user wants nothing, exit the dialog
        no: goto goodbye on #messageHasIntent("agreement", "negative");
        nothing: goto goodbye on #messageHasIntent("nothing");
    }
}

// node needed just to specify a question
node what_do_you_need {
    do {
        #log("node 'what_do_you_need'");
        #sayText("What do you need?", repeatMode: "ignore");
        goto next;
    }
    transitions {
        next: goto main_hub;
    }
}

digression what_services {
    conditions {
        on #messageHasIntent("what_services") priority -1;
    }
    do {
        #log("digression 'what_services'");
        // say phrases with 'repeatMode:"ignore"' due to not be repeated with #repeat()
        #sayText("We have got several services.", repeatMode:"ignore");
        #sayText("If you are hungry, you may order some food.", repeatMode:"ignore");
        #sayText("You can also ask to clean your apartment", repeatMode:"ignore");
        #sayText("Or you can ask information about your checking out", repeatMode:"ignore");
        // repeat last phrase pronounced without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

digression order_food {
    conditions {
        on #messageHasIntent("order_food");
    }
    do {
        #log("digression 'order_food'");
        // if this request is already asked, then just say we've got it
        if (!$askedFood) {
            #sayText("Ok, we will bring a dinner to your apartment.", repeatMode:"ignore");
        } else {
            #sayText("Ok, I have already got it.", repeatMode:"ignore");
        }
        set $askedFood = true;
        // repeat last phrase pronounced without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

digression check_out_info {
    conditions {
        on #messageHasIntent("check_out_info");
    }
    do {
        #log("digression 'check_out_info'");
        #sayText("Your checking out is scheduled for Wednesday at 5 pm.", repeatMode:"ignore");
        set $askedCheckOutInfo = true;
        // repeat last phrase pronounced without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;    
    }
}

digression need_cleaning {
    conditions {
        on #messageHasIntent("need_cleaning");
    }
    do {
        #log("digression 'need_cleaning'");
        if (!$askedCleaning) {
            #sayText("I will send someone to clean your room, please wait.", repeatMode:"ignore");
        } else {
            #sayText("Ok, I have already got it.", repeatMode:"ignore");
        }
        set $askedCleaning = true;
        // repeat last phrase pronounced without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

digression goodbye {
    conditions {
        on #messageHasIntent("bye") priority -50;
    }
    do {
        #log("digression 'goodbye'");
        goto goodbye;
    }
    transitions {
        goodbye: goto goodbye;
    }
}

node goodbye {
    do {
        #log("node 'goodbye'");
        #sayText("You can call me any time. Goodbye!");
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
