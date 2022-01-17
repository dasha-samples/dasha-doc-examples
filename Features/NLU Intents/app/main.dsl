context {
    input phone: string;
    output askedFood: boolean = false;
    output askedCleaning: boolean = false;
    output askedCheckOutInfo: boolean = false;
}

start node root {
    do {
        #log($phone);
        #connectSafe($phone);
        if (#waitForSpeech(2000)) {
            wait * ;
        }
        else {
            goto force_greeting;
        }
    }
    transitions {
        greeting: goto greeting on true;
        force_greeting: goto greeting;
    }
}

node greeting {
    do {
        #log("node 'greeting'");
        #sayText("Hello, this is a hotel reception.");
        #sayText("Is there anything I can do for you?");
        goto next;
    }
    transitions {
        next: goto ask_service_hub;
    }
}

node what_do_you_need {
    do {
        #log("node 'what_do_you_need'");
        #sayText("What do you need?", repeatMode: "ignore");
        goto next;
    }
    transitions {
        next: goto ask_service_hub;
    }
}

node ask_service_hub {
    do {
        #log("node 'hub'");
        wait*;
    }
    transitions {
        yes: goto what_do_you_need on #messageHasIntent("agreement", "positive");
        no: goto goodbye on #messageHasIntent("agreement", "negative");
        nothing: goto goodbye on #messageHasIntent("nothing");
    }
}

digression what_services {
    conditions {
        on #messageHasIntent("what_services") priority -1;
    }
    do {
        #log("digression 'what_services'");
        #sayText("We have got several services.", repeatMode:"ignore");
        #sayText("If you are hungry, you may order some food.", repeatMode:"ignore");
        #sayText("You can also ask to clean your apartment", repeatMode:"ignore");
        #sayText("Or you can ask information about your checking out", repeatMode:"ignore");
        #repeat();
        return;
    }
}


digression order_food {
    conditions {
        on #messageHasIntent("order_food");
    }
    do {
        #log("digression 'order_food'");
        if (!$askedFood) {
            #sayText("Ok, we will bring a dinner to your apartment.", repeatMode:"ignore");
        } else {
            #sayText("Ok, I have already got it.", repeatMode:"ignore");
        }
        set $askedFood = true;
        #repeat();
        return;
    }
}

digression check_out_info {
    conditions {
        on #messageHasIntent("check_out_info");
    }
    do {
        #log("digression 'check_out_info'");
        if (!$askedCheckOutInfo) {
            #sayText("Your checking out is scheduled for Wednesday at 5 pm.", repeatMode:"ignore");
        } else {
            #sayText("Ok, I have already got it.", repeatMode:"ignore");
        }
        set $askedCheckOutInfo = true;
        #repeat();
        return;
    }
}

digression need_cleaning {
    conditions {
        on #messageHasIntent("need_cleaning");
    }
    do {
        #log("digression 'need_cleaning'");
        if (!$askedCleaning) {
            #sayText("I will send someone to clean your room, please wait.", repeatMode:"ignore");
        } else {
            #sayText("Ok, I have already got it.", repeatMode:"ignore");
        }
        set $askedCleaning = true;
        #repeat();
        return;
    }
}

digression dont_understand {
    conditions {
        on true priority -100;
    }
    do {
        #log("digression 'dont_understand'");
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        #repeat();
        return;
    }
}

digression goodbye {
    conditions {
        on #messageHasIntent("bye") priority -50;
    }
    do {
        #log("digression 'goodbye'");
        goto goodbye;
    }
    transitions {
        goodbye: goto goodbye;
    }
}

node goodbye {
    do {
        #log("node 'goodbye'");
        #sayText("You can call me any time. Goodbye!");
        exit;
    }
}
