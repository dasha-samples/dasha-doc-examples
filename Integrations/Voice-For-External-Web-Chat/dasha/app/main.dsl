context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    input conversationId: string;
}

external function close_conversation(conversationId: string): empty;
external function process_user_text(conversationId: string, userText: string): string?;

start node root {
    do {
        #connectSafe($endpoint);
        
       wait*;
    }
    transitions {
        step: goto step on true;
    }
}

node step {
    do {
        var response = external process_user_text($conversationId,#getMessageText());
        if(response is not null) {
            #sayText(response);
            wait *;
        } else {
            #log("Received empty response, closing conversation");
            exit;
        }
        wait*;
    }
    transitions {
        step: goto step on true;
    }
}


// this digression triggers when user hangs up
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        external close_conversation($conversationId);
        exit;
    }
}
