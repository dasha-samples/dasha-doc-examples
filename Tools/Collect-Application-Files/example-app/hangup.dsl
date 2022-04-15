library

// import "../../main.dsl";

context
{
    output serviceStatus: string?;
    output status: string?;
    output taskStatus: string?;
}

global digression hangup
{
    conditions
    {
        on true tags: onclosed;
    }
    var defaultStatus: string = "emptyCall";
    
    do
    {
        set $status = $status ?? "None";
        set $serviceStatus = "UserHangup";
        set $clientStatus = $clientStatus ?? "userHangup";
        set $taskStatus = $taskStatus ?? digression.hangup.defaultStatus;
        set $failReason = $failReason ?? 7; // timeslot not selected: refusal talk
        exit;
    }
}
