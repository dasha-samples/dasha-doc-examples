library
context
{
    output serviceStatus: string?;
    output status: string?;
    output taskStatus: string?;
    output failReason: number?;
    output clientStatus: string?;
    output details: string?;
    output callStatus: string?;
}

digression answering_machine
{
    conditions
    {
        on #messageHasAnyIntent(digression.answering_machine.triggers);
    }
    var triggers = ["answering_machine"];
    var serviceStatus = "AnsweringMachine";
    var status = "AnsweringMachine";
    do
    {
        set $serviceStatus=digression.answering_machine.serviceStatus;
        set $status=digression.answering_machine.status;
        //set $status = "Done";
        set $failReason = 4;
        set $taskStatus = "callFailed";
        set $callStatus = "CALL_REDIRECTED_TO_ANSWERING_MACHINE";
        set $clientStatus = "Answering machine";
        set $details = "Answering machine";
        exit;
    }
    transitions
    {
    }
}
