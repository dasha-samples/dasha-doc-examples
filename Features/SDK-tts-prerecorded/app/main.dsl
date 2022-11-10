context {
    input endpoint: string;
    output success: boolean = false;
}

start node hello {
    do {
        #connectSafe($endpoint);
        #say("can_you_hear_me");
        wait *;
    }
    transitions {
        positive: goto positive on #messageHasSentiment("positive");
        negative: goto negative on #messageHasSentiment("negative");
        @timeout: goto @timeout on timeout 10000;
    }
}

node positive {
    do {
        #say("i_can_hear_you_too");
        set $success = true;
        exit;
    }
}

node negative {
    do {
        #say("i_can_hear_you");
        wait *;
    } 
    transitions {
        positive: goto positive on #messageHasSentiment("positive");
        negative: goto remote_side_fail on #messageHasSentiment("negative");
        @timeout: goto @timeout on timeout 10000;
    }
}

node @timeout {
    do {
        #repeat();
        wait *;
    }
    transitions {
        positive: goto positive on #messageHasSentiment("positive");
        negative: goto remote_side_fail on #messageHasSentiment("negative");
        @timeout: goto fail on timeout 10000;
    }
}

node fail {
    do {
        #say("i_cant_hear_you");
        exit;
    }
}

node remote_side_fail {
    do {
        #say("you_cant_hear_me");
        exit;
    }
}