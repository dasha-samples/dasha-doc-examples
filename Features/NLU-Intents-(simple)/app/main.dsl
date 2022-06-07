/**
The dialogue script consists of three main nodes: 
- `root` - start node that connects to user and tells him initial information
- `goodbye` - terminal node that is visited if user wishes to end the dialogue
- `echo` - digression that triggers on any other user input and repeats user's words

Also, there is a handler for the event when user hangs up - user hangup `digression`.
Without it the dialogue ends with an error because of the unhandled event.
*/

context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;
}

start node root {
    do {
        #log("node 'root'");
        #connectSafe($endpoint);
        // wait for user voice for 2000 ms
        #waitForSpeech(2000);
        #sayText("Hello, I am simple echo bot.");
        #sayText("To exit the dialogue say the phrase ... I want to exit");
        wait*;
    }
    transitions {
        // transition that triggers on intent 'exit'
        goodbye: goto goodbye on #messageHasIntent("exit");
    }
}

digression echo {
    conditions {
        on true priority -1;
    }
    do {
        #log("digression 'echo'");
        #sayText("You said: " + #getMessageText());
        return;
    }
}

node goodbye {
    do {
        #log("node 'goodbye'");
        #sayText("You said that you want to exit. Goodbye!");
        // interrupt the dialogue 
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
