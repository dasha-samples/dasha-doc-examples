/**

The DSL script consists of a few nodes:
- node `root` - initiates the dialogue
- digression `language_echo` - echoes extracted language
- digression `dont_understand` - handles case when nothing was recognized

Also, there is handler for user hang up event - digression `user_hangup`. 
Without it the dialogue would end with an error in case of user hangs up a phone.

The entity is extracted and checked in digression `language_echo`.
Notice the condition of this digresison: it is implemented via `messageHasData` - builtin DSL function that checks if entity is in user's input.
The actual value extraction is made with DSL function `#messageGetData`.
(See those and other NLU functions in out [doc](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control))
Then the value is compared with predefined languages and after that Dasha reacts depending on this comparison.

To learn more about digressions see the [digressions doc](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression)

*/

context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;

    predefinedLanguages: string[] = ["german","french","russian","english","chineese"];

    // output parameters (will be set during the dialogue)
    output extractedLanguages: string[] = [];
}

start node root {
    do {
        #log("node 'root'");
        #connectSafe($endpoint);
        // wait for user voice for 2000 ms
        #waitForSpeech(2000);
        #sayText("Hello! I will ask you about languages.");
        #sayText("To stop it, hangup your phone or say 5 languages.");
        #sayText("Otherwise, this conversation will last like forever.");
        #sayText("So, now please tell me. What language do you speak?");
        wait*;
    }
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
            if (pl == extractedLanguage) set isKnownLanguage = true;
        if (isKnownLanguage)
            #sayText("Oh, " + extractedLanguage + ", I know that one!");
        else
            #sayText("Hm, I don't know language " + extractedLanguage + ", but I think I've heard of it");
        $extractedLanguages.push(extractedLanguage);
        // terminate the dialogue if 5 languages are extracted
        if ($extractedLanguages.length() >= 5) {
            exit;
        }
        #sayText("What other languages do you speak?");
        return;
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
        #sayText("Seems like I dont know this language", repeatMode:"ignore");
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
