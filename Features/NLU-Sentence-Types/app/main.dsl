/**

The script consists of a few nodes. After initiating a call and dialogue comes to the endless loop:
- node `listen` is used to just get user input and go the node `guess`
- node `guess` is used to say some text about the sentence type and return back to `listen` (or handle the exit trigger )

To interrupt the loop user must say the sentence that contains entity `dialogue`, intent `finish` (see `app/data.json`) 
and the type of the sentence must be `request` - this is the trigger to end the conversation.

*/

context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;

    // output parameters (will be set during the dialogue)
    // recognized sentences grouped by their types
    output recognitions: {
        statement: string[];
        request: string[];
        question: string[];
        other: string[];
    } = {
        statement: [],
        request: [],
        question: [],
        other: []
    };
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
        #sayText("Hello! Let me guess your sentence type.");
        goto next;
    }
    transitions {
        next: goto listen;
    }
}

node listen {
    do {
        wait *;
    }
    transitions {
        guess: goto guess on true;
    }
}

node guess {
    do {
        /**
        Possible sentenceType values:
            statement - Declarative sentences: Used to make statements or relay information
            request - Imperative sentences: Used to make a command or give a direct instruction
            question - Interrogative sentences: Used to ask a question
            null - type of sentence is not classified (create custom intents or/and entities, then it will be classified)
        */
        // init local variable sentenceType with the value of getSentenceType()
        var sentenceType = #getSentenceType();
        if (sentenceType is not null) {
            #sayText("I think it is " + sentenceType + " sentence.");
            $recognitions[sentenceType]?.push(#getMessageText());
        } else {
            #sayText("Strange, I could not recognize this sentence type.");
            $recognitions.other.push(#getMessageText());
        }
        // handle the exit trigger
        if (sentenceType == "request" && #messageHasIntent("finish") && #messageHasData("dialogue")) {
            #sayText("Seems like you ask me to end this conversation");
            goto goodbye;
        }
        #sayText("Please, tell me one more thing or ask me to finish the dialog");
        goto listen;
    }
    transitions {
        listen: goto listen;
        goodbye: goto goodbye;
    }
}

node goodbye {
    do {
        #log("node 'goodbye'");
        #sayText("Bye!");
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
