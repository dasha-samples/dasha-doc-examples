library

async block AnotherInterlocutor(endpoint:string, parentId:string)
{   
    start node root
    {
        do
        {
            // #connectSafe("65");
            #connectSafe($endpoint);
            #waitForSpeech(1000);
            #sayText("I say enterence message for you");
            #bridgeChannel();
            wait *;
        }
        transitions
        {
            @cycle: goto @cycle on true;
        }
    }
    
    node cycle
    {
        do
        {
            #sayText("For child");
            wait *;
        }
        transitions
        {
            @cycle: goto @cycle on true;
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
