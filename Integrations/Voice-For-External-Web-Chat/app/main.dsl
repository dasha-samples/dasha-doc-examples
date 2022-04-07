context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    input conversation_id: string;
}

type Event = {
    messages: string[];
    exit_dialogue: boolean?;
};

external function check_new_events(conversation_id: string): Event[];
external function close_conversation(conversation_id: string): empty;

start node root {
    do {
        #connectSafe($endpoint);
        
        goto hub_transition;
    }
    transitions {
        hub_transition: goto hub;
    }
}

node hub {
    do{
        // wait for preprocessors to trigger
        #log("waiting for events");
        wait *;
    }
}

preprocessor digression check_new_events {
    conditions {
        // triggers every 1000 milliseconds
        on timeout 1000;
    }
    do {
        #log("preprocessor 'check_new_events'");
        var new_events: Event[] = external check_new_events($conversation_id);
        for (var event in new_events) {
            for (var msg in event.messages)
                #sayText(msg);

            if (event.exit_dialogue == true)
                goto exit_dialogue;
        }
        return;
    }
    transitions {
        exit_dialogue: goto exit_dialogue;
    }
}

node exit_dialogue {
    do {
        exit;
    }
}

// this digression triggers when user hangs up
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        external close_conversation($conversation_id);
        exit;
    }
}
