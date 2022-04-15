library
context
{
    output serviceStatus: string?;
    output status: string?;
    output callBackDetails: string?;
    output clientStatus: string?;
    output details: string?;
    output failReason: number?;
    output taskStatus: string?;
    output callStatus: string?;
}

digression sorry_wont_call
{
    conditions
    {
        on #messageHasAnyIntent(digression.sorry_wont_call.triggers) priority 1010;
    }
    
    var triggers: string[] = ["do_not_call", "you_already_called_me", "wrong_number", "whom_do_you_call", "obscene"];
    var responses: string[] = ["sorry_wont_call"];
    var status = "DontCall";
    var serviceStatus = "Done";
    do
    {
        set $status = digression.sorry_wont_call.status;
        set $serviceStatus = digression.sorry_wont_call.serviceStatus;
        set $clientStatus = "dontCall";
        set $details = "Asked not to call again";
        set $failReason = 9;
        set $taskStatus = "timeslotNotSelected";
        set $callStatus = "CALL_SUCCESSFUL";
        for (var item in digression.sorry_wont_call.responses)
        {
            #sayText(item);
        }
        
        exit;
    }
    transitions
    {
    }
}
