import "talk-to-operator.dsl";
import "types.dsl";

context
{
    input phone: string;
    input phone_interlocutor: string? = null;
    input forward: string? = null;
    childId: string = "";
    childId2: string = "";

    userFeelsFine: boolean = false;

    waitingPhrases:string[] = [
        "Nice weather, huh?", 
        "Did you know that Australia is wider than the moon?",
        "Did you know that pythagorean trousers are equal in all directions?",
        "Where is that guy disappear..?!"
    ];
}


start node root
{
    do
    {
        #setVadPauseLength(1.3);
        #log("phone_interlocutor: " + #stringify($phone_interlocutor));
        #connectSafe($phone);
        #waitForSpeech(1000);
        goto greeting;
       
        wait *;
    }
    transitions
    {
        greeting: goto greeting;
    }
}

node greeting {
    do {
        #sayText("Hi! How are you doing?");
        wait *;
    }
    transitions {
        connect_operator: goto connect_operator on true;
    }
}

node connect_operator {
    do {
        set $userFeelsFine = #messageHasSentiment("positive");
        if ($userFeelsFine) {
            #sayText("Great!");
        }
        
        if($phone_interlocutor is not null)
        {
            #sayText("Let me connect you to our operator.");
            set $childId = blockcall TalkToOperator($phone_interlocutor, #getAsyncBlockDescription().id, {feelsFine: $userFeelsFine}).id;
            #sayText("Waiting for operator to response...");
            wait *;
        }
        else {
            #sayText("Unfortunately, I don't have any available operator phone number. Bye!");
            exit;
        }
    }
    transitions {
        timeoutTransition: goto wait_for_operator_to_connect on timeout 1000;
    }
}

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
        #sayText("Yeah, I think so too!");
        wait *;
    }
    transitions {
        timeoutTransition: goto wait_for_operator_to_connect on timeout 1000;
    }
}

digression HandleBlockStatusMessage
{
    conditions
    {
        on #isBlockMessage("Content") tags: onblock;
    }
    do
    {
        var message = #getAsyncBlockMessage() as ContentAsyncBlockMessage;
        if (message is null) { return; }
        var content = message.content;
        var status = (content as StatusMessage)?.status;
        if (status is null) { return; }

        if (status == "operator answered") {
            #sayText("The operator have picked up the phone just now.");
            #sayText("Please, wait for a minute, until I provide him some information. I will connect you soon.");
            #disableRecognition();
            goto endless_waiting;
        }
        else if (status == "operator declined call") {
            #sayText("I am sorry, the operator declined the call.");
            #sayText("Goodbye!");
            #disableRecognition();
            exit;
        }
        else if (status == "operator accepted call") {
            #sayText("Connecting you to the operator right now.");
            #sayText("Bye!!");
            #bridgeChannel([$childId]);
            #disableRecognition();
            goto endless_waiting;
        }
    }
    transitions {
        endless_waiting: goto endless_waiting;
    }
}

node endless_waiting {
    do {
        wait*;
    }
}


preprocessor digression dtmf
{
    conditions
    {
        on true tags: onprotocol;
    }
    do
    {
        if(#getDTMF() == "1")
        {
            #enableRecognition();
        }
        if(#getDTMF() == "2")
        {
            #disableRecognition();
        }
        if(#getDTMF() == "3")
        {
            exit;
        }
        return;
    }
}



digression Hangup
{
    conditions
    {
        on true tags: onclosed;
    }
    do
    {
        exit;
    }
}

preprocessor digression PreprocessAllMessagesFromBlock
{
    conditions
    {
        on true tags: onblock;
    }
    
    do
    {
        #log(#getAsyncBlockMessage());
        return;
    }
}

digression ExitWhenOneExit
{
    conditions
    {
        on #isBlockMessage("Terminated") tags: onblock;
    }
    do
    {
        #log(#getAsyncBlockMessage());
        exit;
    }
}