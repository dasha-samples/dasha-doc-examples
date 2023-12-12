library

/** asynchronous block that is able to extablish new connection */
async block TalkToOperator(endpoint:string, parentId:string, userInfo: {feelsFine: boolean; userMessage:string;}, sipOptions: SipOptions? = null) {   
    start node root {
        do {
            var options:{ [x: string]: string; } = {};
            if($sipOptions is not null)
            {
                $sipOptions.attachToOptions(options);
            }
            /** establish new connection */
            #connectSafe($endpoint, options: options);
            /** notify parent block that operator picked up his phone */
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator answered" });
            #waitForSpeech(1000);
            /** provide some information about the user passed in block */
            #sayText("Hi, this is Dasha AI bot. I have a user who wants to talk to you right now.");
            #sayText("The user said that he is " + (!$userInfo.feelsFine ? "not ": "") + "doing well right now.");
            #sayText("He asked to give you a message. He said: " + $userInfo.userMessage);
            /** ask if operator is ready */
            #sayText("Are you ready to accept the call?");
            wait *;
        }
        transitions {
            yes: goto accept_user on #messageHasSentiment("positive");
            no: goto decline_user on #messageHasSentiment("negative");
        }
    }

    /** if operator is ready, then notify parent block that we are ready to bridge user and operator */
    node accept_user {
        do {
            #sayText("Ok, I am now going to connect the user to you in a few seconds. Thank you!");
            /**  turn off background noise for operator */
            #noiseControl(false);
            /** disable stt and nlu in dialogue Dasha-operator */
            #disableRecognition();
            /** send command to parent block to say phrase */
            #sayTextChanneled("Connecting you to the operator right now. Bye!!", [$parentId]);
            /** notify parent block to bridge user's and operator's channels */
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator accepted call" });
            wait *;
        }
    }
    /** if operator declines the call, then notify parent block that conversation must be over */
    node decline_user {
        do {
            #sayText("Ok, I will drop the user.");
            /** disable stt and nlu in dialogue Dasha-operator */
            #disableRecognition();
            /** send command to parent block to say phrase */
            #sayTextChanneled("I am sorry, the operator declined the call. Goodbye!", [$parentId]);
            /** notify parent block to terminate the conversation */
            #sendMessageToAsyncBlock($parentId, "Content", { status: "operator declined call" });
            wait *;
        }
    }
    /** if any other block is terminated, exit the dialogue */
    digression exit_when_parent_block_exit {
        conditions {
            on #isBlockMessage("Terminated") tags: onblock;
        }
        do {
            #log("[child] terminating, reason:" + #stringify(#getAsyncBlockMessage()));
            exit;
        }
    }
    /** handle operator's hangup (will cause termination of parent block) */
    digression hangup_child {
        conditions {
            on true tags: onclosed;
        }
        do {
            #log("[child] operator hangup");
            exit;
        }
    }
    /** just log any block message */
    preprocessor digression log_block_message {
        conditions {
            on true tags: onblock;
        }
        do {
            #log("[child] got message: " + #stringify(#getAsyncBlockMessage()));
            return;
        }
    }
    
}
