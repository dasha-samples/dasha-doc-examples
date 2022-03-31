context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;

    poem: string[] = [
        "To him an heir was afterward born,",
        "a son in his halls, whom heaven sent",
        "to favor the folk, feeling their woe",
        "that erst they had lacked an earl for leader",
        "so long a while; the Lord endowed him,",
        "the Wielder of Wonder, with world’s renown.",
        "Famed was this Beowulf: far flew the boast of him,",
        "son of Scyld, in the Scandian lands.",
        "So becomes it a youth to quit him well",
        "with his father’s friends, by fee and gift,",
        "that to aid him, aged, in after days,",
        "come warriors willing, should war draw nigh,",
        "liegemen loyal: by lauded deeds",
        "shall an earl have honor in every clan."
    ];
    poemName: string = "Beowulf";
    poemDescription: string = "It is an Old English epic poem in the tradition of Germanic heroic legend";
    // current poem row index
    rowIndex: number = 0;

    // output parameters (will be set during the dialogue)
    output isDigressionTriggered: boolean = false;
}


type WhatPoemResult = "continue" | "finish";


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
        #sayText("Hi! Let's test complex logic in digressions.");
        #sayText("I'm going to read a poem for you.");
        #sayText("You can ask me about this poem any time and we will talk about it.");
        #sayText("Try me!");
        #sayText("...");
        goto read_poem_and_await_digression;
    }
    transitions {
        read_poem_and_await_digression: goto read_poem_and_await_digression;
    }
}

node read_poem_and_await_digression {
    do {
        if ($poem.length() == $rowIndex) {
            #sayText("That was the end of the poem!");
            goto goodbye;
        }
        #sayText($poem[$rowIndex]??"", interruptible: true);
        set $rowIndex += 1;
        wait*;
    }
    transitions {
        goodbye: goto goodbye;
        wait_timeout: goto read_poem_and_await_digression on timeout 1000;
    }
}

block WhatPoem(name: string, description: string):WhatPoemResult {
    start node root {
        do {
            #log("block 'WhatPoem'");
            #sayText("This poem is called ... " + $name + ".");
            #sayText($description);
            #sayText("Do you like it?");
            wait*;
        }
        transitions {
            yes: goto ask_continue on #messageHasSentiment("positive");
            no: goto ask_continue on #messageHasSentiment("negative");
        }
    }
    node ask_continue {
        do {
            #sayText("Would you like to continue?");
            wait*;
        }
        transitions {
            yes: goto continue_reading on #messageHasSentiment("positive");
            no: goto finish_reading on #messageHasSentiment("negative");
        }
    }
    node finish_reading {
        do {
            // return value from block
            return "finish";
        }
    }
    node continue_reading {
        do {
            // return value from block
            return "continue";
        }
    }
}

digression what_poem {
    conditions {
        on #messageHasIntent("what_poem");
    }
    var was_triggered = false;
    do {
        #log("digression 'what_poem'");
        set $isDigressionTriggered = true;

        var block_result = blockcall WhatPoem($poemName, $poemDescription);
        #log("returned from block with result '" + block_result + "'");

        // switch over digression results
        if (block_result == "continue") {
            // if block returned "continue" then return back to the dialogue
            #sayText("Ok, we have stopped at row " + ($rowIndex + 1).toString() + " .");
            #sayText("I shall continue to read now.");
            #sayText("...");
            return;
        }
        // block returned "finish"
        #sayText("Ok! It was nice to read you a poem.");
        goto goodbye;
    }
    transitions {
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
global digression dont_understand {
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
global digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}
