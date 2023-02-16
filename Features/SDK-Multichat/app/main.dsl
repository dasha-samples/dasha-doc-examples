/*import "./commonDialogue.dsl";*/

type names = "kuzma" | "veneamin" | "alex";

context
{
    input phone: string,
    input username: names,
    input numerator: number,
    on_yes:number?,
    on_no:number?,
    on_something_else:number?,
    denominator:number?,
    output status:string?,
    output serviceStatus:string?,
    output callBackDetails:string?,
}

external function set_denominator(den:number):unknown;
external function get_division_result():number;

start node root
{
    do
    {
        #connectSafe($phone);
        #log("connected");
        #waitForSpeech(8000);
        #say("introduce_self",
        {
            username: $username
        }
        );
        
        wait *;
    }
    transitions
    {
        intro: goto intro on true;
    }
}

node intro
{
    do
    {
        #say("ask_divide",
        {
            numerator: $numerator
        }
        );
        
        set $on_yes=4;
        set $on_no=5;
        set $on_something_else=6;
        
        wait *;
    }
    transitions
    {
        yes: goto calculate on #messageHasSentiment("positive");
        no: goto calculate on #messageHasSentiment("negative");
        whatever: goto calculate on true;
    }
    onexit
    {
        yes:
        do
        {
            set $denominator=$on_yes;
        }
        no:
        do
        {
            set $denominator=$on_no;
        }
        whatever:
        do
        {
            set $denominator=$on_something_else;
        }
    }
}

node calculate
{
    do
    {
        if($denominator is not null)
        {
            var tmp = external set_denominator($denominator);
            #say("let_me_think",
            {
                denominator:$denominator
            }
            );
            var result=external get_division_result();
            #say("result_is",
            {
                value: result
            }
            );
            wait *;
        }
        else
        {
            #log("Something went wrong");
            exit;
        }
    }
    transitions
    {
        yes: goto agree on #messageHasSentiment("positive");
        no: goto disagree on #messageHasSentiment("negative");
    }
}

node disagree
{
    do
    {
        #say("sorry_goodbye");
        set $status = "disagreed";
        set $serviceStatus = "Done";
        exit;
    }
    transitions
    {
    }
}

node agree
{
    do
    {
        #say("get_gotted");
        set $status = "agreed";
        set $serviceStatus = "Done";
        exit;
    }
    transitions
    {
    }
}

digression create_additional_channel
{
    conditions
    {
        on #getMessageText() == "create new channel";
    }
    do
    {
        var new_block = blockcall additional_channel();
        return;
    }
}

digression dtmf
{
    conditions
    {
        on #getDTMF() is not null tags: onprotocol;
    }
    do
    {
        var data = #getDTMF();
        #log(data);
        return;
    }
}

async block additional_channel()
{
    context 
    {
        text: string = "";
    }

    start node root
    {
        do
        {
            #connectSafe("");
            #sayText("Hi!");
            goto talk;
        }
        transitions
        {
            talk: goto talk;
        }
    }
    
    node talk
    {
        do
        {
            #log(#getAsyncBlockDescription().id + " " + $text);
            wait *;
        }
        transitions
        {
            recognized: goto talk on true;
        }
        onexit
        {
            recognized: do {
                set $text = #getMessageText();
            }
        }
    }
}
