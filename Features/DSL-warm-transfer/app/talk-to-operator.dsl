library


async block TalkToOperator(endpoint:string, parentId:string, userInfo: {feelsFine: boolean;})
{   
    start node root
    {
        do
        {
            #setVadPauseLength(1.3);
            #connectSafe($endpoint);
            #waitForSpeech(1000);
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator answered" });

            #sayText("Hi, this is Dasha AI bot. I have a user who wants to talk to you right now.");
            #sayText("The user said that he is " + (!$userInfo.feelsFine ? "not ": "") + "doing well right now.");
            #sayText("Are you ready to accept the call?");
            
            wait *;
        }
        transitions
        {
            yes: goto connect_user_to_operator on #messageHasSentiment("positive");
            no: goto decline_user on #messageHasSentiment("negative");
        }
    }

    node connect_user_to_operator {
        do {
            #sayText("Ok, I am now going to connect the user to you right now. Thank you! Bye.");
            #disableRecognition();
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator accepted call" });
            wait *;
        }
    }

    node decline_user {
        do {
            #sayText("Ok, I will drop the user.");
            #disableRecognition();
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator declined call" });
            wait *;
        }
    }




    digression ExitWhenParentExit
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
    
    digression HangupChild
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
    
    preprocessor digression dtmfChild
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
}
