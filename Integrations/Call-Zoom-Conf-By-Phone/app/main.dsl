context {
    input endpoint: string;
    input meeting_id: string;
    input participant_id: string?;
    output success: boolean = false;
}

start node connect {
    do {
        #connectSafe($endpoint);
        #waitForSpeech(1000);
        goto set_english;
    }
    transitions {
        set_english: goto set_english;
    }
}

node set_english
{
    do
    {
        #sendDTMF("0");
        #log("sent '0' to set english");
        wait*;
    }
    transitions
    {
        pass_meeting_id: goto pass_meeting_id on true;
    }
}

node pass_meeting_id
{
    do
    {
        for (var char in $meeting_id.split("")) {
            #sendDTMF(char);
        }
        #sendDTMF("#");
        #log("sent meeting id");
        wait*;
    }
    transitions
    {
        pass_participant_code: goto pass_participant_id_and_confirm on true;
    }
}

node pass_participant_id_and_confirm
{
    do
    {
        if ($participant_id is not null) {
            for (var char in $meeting_id.split("")) {
                #sendDTMF(char);
            }
            #log("sent participant id");
        }
        #sendDTMF("#");
        #log("confirmed joining conference");
        wait*;
    }
    transitions
    {
        hello: goto hello on #messageHasIntent("in_meeting");
    }
}

node hello {
    do {
        #log("in hello");
        #waitForSpeech(2000);
        #sayText("Hello, can you hear me?");
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