context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    input conversation_id: string;
}

external function get_chatbot_input(conversation_id: string): string?;
external function close_conversation(conversation_id: string): empty;
external function send_user_input(conversation_id: string, user_input: string): empty;

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
        external send_user_input($conversation_id,#getMessageText());
        goto hub_transition;
    }
    transitions {
        hub_transition: goto hub;
    }
}

node hub {
    do{
        var message = external get_chatbot_input($conversation_id);

        if(message is not null) {
            #sayText(message);
            wait *;
        } else {
            exit;
        }
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
