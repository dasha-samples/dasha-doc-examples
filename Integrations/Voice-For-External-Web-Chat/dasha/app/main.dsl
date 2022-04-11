context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    input conversation_id: string;
}

// external function get_chatbot_input(conversation_id: string): string?;
external function close_conversation(conversation_id: string): empty;
external function process_user_text(conversation_id: string, user_text: string): string?;

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
        var response = external process_user_text($conversation_id,#getMessageText());
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
        external close_conversation($conversation_id);
        exit;
    }
}
