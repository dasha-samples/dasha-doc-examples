library
context
{
    output serviceStatus: string?;
    output status: string?;
    output clientStatus: string?;
    output details: string?;
    output failReason: number?;
    output taskStatus: string?;
    output callStatus: string?;
}

preprocessor digression repeat_preprocessor
{
    conditions
    {
        on true priority 50000;
    }
    do
    {
        if (digression.repeat.resetOnRecognized)
        {
            set digression.repeat.counter = 0;
        }
        set digression.repeat.resetOnRecognized = true;
        return;
    }
}

digression repeat_hangup_params
{
    conditions
    {
        on false;
    }
    var responses: string[] = ["dont_understand_hangup"];
    var status = "RepeatHangup";
    var serviceStatus = "Done";
    do
    {
    }
}

digression repeat
{
    conditions
    {
        on #messageHasAnyIntent(digression.repeat.triggers) priority 1600;
    }
    var retriesLimit = 2;
    var counter = 0;
    var resetOnRecognized=false;
    var triggers: string[] = ["repeat", "dont_understand"];
    var responses: string[] = ["i_said"];
    do
    {
        if (digression.repeat.counter > digression.repeat.retriesLimit)
        {
            goto hangup;
        }
        var failReasonCopy = $failReason;
        set $failReason = 9; // handling user_hangup during reaction
        
        set digression.repeat.counter = digression.repeat.counter + 1;
        set digression.repeat.resetOnRecognized = false;
        for (var item in digression.repeat.responses)
        {
            #sayText(item, repeatMode: "ignore");
        }
        #repeat();
        set $failReason = failReasonCopy;
        return;
    }
    transitions
    {
        hangup: goto repeat_or_ping_hangup;
    }
}

digression ping
{
    conditions
    {
        on #messageHasIntent("ping") priority -900;
    }
    do
    {
        if (digression.repeat.counter > digression.repeat.retriesLimit)
        {
            goto hangup;
        }
        
        #repeat(accuracy: "short");
        set digression.repeat.counter = digression.repeat.counter + 1;
        return;
    }
    transitions
    {
        hangup: goto repeat_or_ping_hangup;
    }
}

node repeat_or_ping_hangup
{
    do
    {
        set $clientStatus = "repeatHangup";
        set $details = "Communication problems (to many requeats to repeat)";
        set $failReason = 9;
        set $taskStatus = "timeslotNotSelected";
        set $callStatus = "CALL_SUCCESSFUL";
        //set $status = "RepeatHangup";
        set $status=digression.repeat_hangup_params.status;
        set $serviceStatus=digression.repeat_hangup_params.serviceStatus;
        for (var item in digression.repeat_hangup_params.responses)
        {
            #sayText(item, repeatMode: "ignore");
        }
        exit;
    }
}
