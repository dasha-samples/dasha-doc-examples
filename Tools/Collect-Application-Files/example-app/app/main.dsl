import "./common/commonDialogue-part1.dsl";
import "../commonDialogue-part2.dsl";
import "../another-folder/another-folder/wait.dsl";

context {
    input endpoint: string;
    output success: boolean = false;
}

start node hello {
    do {
        #connectSafe($endpoint);
        #sayText("Hello, can you hear me?");
        wait *;
    }
    transitions {
        positive: goto positive on #messageHasSentiment("positive");
        negative: goto negative on #messageHasSentiment("negative");
    }
}

node positive {
    do {
        #sayText("And I can hear you too. Goodbye");
        set $success = true;
        exit;
    }
}

node negative {
    do {
        #sayText("Can you hear me? I can hear you");
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
        #sayText("I can't hear your. Goodbye");
        exit;
    }
}

node remote_side_fail {
    do {
        #sayText("You can't hear me. So sorry and goodbye.");
        exit;
    }
}