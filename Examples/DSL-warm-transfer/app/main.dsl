import "talk-to-operator.dsl";
import "types.dsl";

context
{
    input phone: string;
    /** operator's endpoint */
    input phone_interlocutor: string? = null;

    childId: string = "";
    waitingPhrases:string[] = [
        "Nice weather, huh?", 
        "Did you know that Australia is wider than the moon?",
        "Did you know that pythagorean trousers are equal in all directions?",
        "Where is that guy disappear..?!"
    ];
    
    output userFeelsFine: boolean = false;
    output userMessage: string = "";
    output operatorStatus: "none"|"answered"|"accepted"|"declined" = "none";
}


start node root {
    do {
        #setVadPauseLength(1.3);
        #log("phone_interlocutor: " + #stringify($phone_interlocutor));
        #connectSafe($phone);
        #waitForSpeech(1000);
        goto greeting;
        wait *;
    }
    transitions {
        greeting: goto greeting;
    }
}
/** collect some information about the user in nodes 'ask_how_are_you', 'ask_message' */
node greeting {
    do {
        #sayText("Hello!");
        if($phone_interlocutor is null) {
            #sayText("Unfortunately, I don't have any available operator phone number. Please, provide operator's endpoint in command line. Bye!");
            exit;
        }
        #sayText("I'm gonna ask you a few questions and then I will connect you to an operator.");
        goto ask_how_are_you;
    }
    transitions {
        ask_how_are_you: goto ask_how_are_you;
    }
}
node ask_how_are_you {
    do {
        #sayText("How are you doing?");
        wait *;
    }
    transitions {
        ask_message: goto ask_message on true;
    }
}
node ask_message {
    do {
        set $userFeelsFine = #messageHasSentiment("positive");
        if ($userFeelsFine) {
            #sayText("Great!");
        }
        #sayText("What would you like me to say to an operator?");
        wait*;
    }
    transitions {
        connect_to_operator: goto connect_to_operator on true;
    }
}
/** call async block, provide endpoint, parentBlockId and some custom information there */
node connect_to_operator {
    do {
        set $userMessage = #getMessageText();
        if ($phone_interlocutor is null) exit; // already checked before
        #sayText("Let me connect you to our operator.");
        /** NOTE: async block call is non-blocking, so we go further immediately */
        set $childId = blockcall TalkToOperator(
            $phone_interlocutor, 
            #getAsyncBlockDescription().id, 
            {feelsFine: $userFeelsFine, userMessage: $userMessage}
        ).id;
        #sayText("Waiting for operator to response...");
        wait *;
    }
    transitions {
        timeoutTransition: goto wait_for_operator_to_connect on timeout 2000;
    }
}

/** wait until operator picks up his phone and keep client "warm" in endless loop */
node wait_for_operator_to_connect {
    do {
        var phrase = $waitingPhrases.shift() ?? "Still waiting for the operator.";
        #sayText(phrase);
        wait*;
    }
    transitions {
        loop: goto loop on true;
    }
}
node loop {
    do {
        #sayText("Mhm..");
        wait *;
    }
    transitions {
        timeoutTransition: goto wait_for_operator_to_connect on timeout 2000;
    }
}
/** triggers when child block 'TalkToOperator' sends any content message */
digression handle_block_content_message {
    conditions {
        on #isBlockMessage("Content") tags: onblock;
    }
    do {
        /** get incoming message and check that it is content message */
        var message = #getAsyncBlockMessage() as ContentAsyncBlockMessage; // ContentAsyncBlockMessage is imported from "types.dsl"
        if (message is null) { return; }
        var content = message.content;
        var status = (content as StatusMessage)?.status; // StatusMessage is imported from "types.dsl"
        if (status is null) { return; }
        /** switch passed status value */
        if (status == "operator answered") {
            set $operatorStatus = "answered";
            /** disable stt and recognition in client's dialogue when operator pick up his phone (just to avoid transitions) */
            #disableRecognition();
            #sayText(
                "The operator have just picked up the phone right now." + 
                "Please, wait for a minute, until I provide him some information. I will connect you soon."
            );
            goto endless_waiting;
        }
        else if (status == "operator declined call") {
            set $operatorStatus = "declined";
            /** this will cause terminating dialogue with operator also due to TalkToOperator block's digression 'exit_when_parent_block_exit' */
            exit;
        }
        else if (status == "operator accepted call") {
            set $operatorStatus = "accepted";
            /** establish the bidirectional bridge between client and operator */
            #bridgeChannel([$childId]);
            /** go to endless loop */
            goto endless_waiting;
        }
    }
    transitions {
        endless_waiting: goto endless_waiting;
    }
}
/** disable stt and nlu recognition and wait for any non-text event (e.g. block-message event) */
node endless_waiting {
    do {
        #disableRecognition();
        /** dialogue continues until someone drops his phone, see :
        *   - digression 'exit_when_any_child_exit'
        *   - digression 'exit_when_parent_block_exit'
        */
        wait*;
    }
}
/** terminate this dialogue if any async child block's dialogue is terminated */
digression exit_when_any_child_exit {
    conditions {
        on #isBlockMessage("Terminated") tags: onblock;
    }
    do {
        #log("[parent] terminating, reason:" + #stringify(#getAsyncBlockMessage()));
        exit;
    }
}
/** handle user hangup (triggers child block termination)*/
digression hangup {
    conditions {
        on true tags: onclosed;
    }
    do {
        #log("[parent] user hangup");
        exit;
    }
}
/** log every block message */
preprocessor digression log_block_message {
    conditions {
        on true tags: onblock;
    }
    do {
        #log("[parent] got message: " + #stringify(#getAsyncBlockMessage()));
        return;
    }
}

