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
    input phone: string;
    predefinedLanguages: string[] = ["german","french","russian","english","chineese"];
}

start node root {
    do {
        #log("node 'root'");
        #connectSafe($phone);
        // wait for user voice for 2000 ms
        #waitForSpeech(2000);
        #sayText("Hello! This conversation will ask you about languages in an endless loop.");
        #sayText("To stop it, hangup your phone.");
        #sayText("Otherwise, this conversation will last like forever.");
        #sayText("So, now please tell me. What language do you speak?");
        wait*;
    }
    /*
    transitions {
        // transition that triggers on intent 'exit'
        goodbye: goto goodbye on ;
    }
    */
}

digression language_echo {
    conditions {
        on #messageHasData("language") priority -1;
    }
    do {
        #log("digression 'language_echo'");
        var extractedLanguage = #messageGetData("language")[0]?.value ?? "";
        var isKnownLanguage = false;
        for (var pl in $predefinedLanguages) 
            if (pl == extractedLanguage) isKnownLanguage = true;
        if (isKnownLanguage)
            #sayText("Oh, " + extractedLanguage + ", I know that one!");
        else
            #sayText("Hm, I don't know about " + extractedLanguage + ", but I think I've heard of it");
        #sayText("What other languages do you speak?");
        return;
    }
}

/*
node goodbye {
    do {
        #log("node 'goodbye'");
        #sayText("You said that you want to exit. Goodbye!");
        // interrupt the dialogue 
        exit;
    }
}
*/

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
