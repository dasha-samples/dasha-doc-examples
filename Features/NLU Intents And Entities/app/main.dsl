context
{
    input phone: string;

    output result: {
        source_account: string;
        target_account: string;
        amount: string;
        success: boolean;
    } = {
        source_account: "",
        target_account: "",
        amount: "",
        success: false
    };
}

start node root
{
    do
    {
        #connectSafe($phone);
        #waitForSpeech(1000);
        #say("greeting");
        
        wait *;
    }
    transitions
    {
        transfer_money: goto transfer_money on #messageHasIntent("transfer_money");
    }
}

preprocessor digression transfer_data
{
    conditions
    {
        on true;
    }
    
    var amount: string = "";
    var source_account: string="";
    var target_account: string="";
    
    do
    {        
        set digression.transfer_data.amount = #messageGetData("numberword", { value: true })[0]?.value??"";
        
        var accounts = #messageGetData("account", { value: true, tag: true });
        var banks = #messageGetData("bank", { value: true, tag: true });

        for (var account in accounts) {
            if (account.tag == "source") {
                set digression.transfer_data.source_account = account?.value??"";
            } else if (account.tag == "target") {
                set digression.transfer_data.target_account = account?.value??"";
            }
        }
        for (var bank in banks) {
            if (bank.tag == "source") {
                set digression.transfer_data.source_account = bank?.value??"";
            } else if (bank.tag == "target") {
                set digression.transfer_data.target_account = bank?.value??"";
            }
        }

        #log({
            parsed_source_account: digression.transfer_data.source_account,
            parsed_target_account: digression.transfer_data.target_account,
            parsed_amount: digression.transfer_data.amount
        });
        return;
    }
}

node transfer_money
{
    do
    {
        if (#getVisitCount("transfer_money") == 1) #say("will_help");
        
        var needSpecifying = false;
        var questions: string[]  = [];

        if ($result.source_account == "") {
            if (digression.transfer_data.source_account == "") {
                set needSpecifying = true;
                questions.push("From what source account would you like to transfer?");
            } else {
                set $result.source_account = digression.transfer_data.source_account;
                set digression.transfer_data.source_account = "";
            }
        }
        
        if ($result.target_account == "") {
            if (digression.transfer_data.target_account == "") {
                set needSpecifying = true;
                if (questions.length() > 0) questions.push("and");
                questions.push("What is your target account?");
            } else {
                set $result.target_account = digression.transfer_data.target_account;
                set digression.transfer_data.target_account = "";
            }
        }

        if ($result.amount == "" and questions.length() < 2) {
            if (digression.transfer_data.amount == "") {
                set needSpecifying = true;
                if (questions.length() > 0) questions.push("and");
                questions.push("How much money would you like to transfer?");
            } else {
                set $result.amount = digression.transfer_data.amount;
                set digression.transfer_data.amount = "";
            }
        }

        if (needSpecifying) {
            #sayText("Please, tell me");
            for (var msg in questions) {
                #sayText(msg);
            }
            wait *;
        } else {
            goto confirm;
        }
    }
    transitions
    {
        provide_data: goto transfer_money on #messageHasIntent("transfer_money") or #messageHasData("bank") or #messageHasData("account") or #messageHasData("numberword");
        confirm: goto transfer_confirmation;
    }
}

node transfer_confirmation
{
    do
    {
        #sayText("Awesome! Let's summarize!");
        #sayText("Transferring $" + $result.amount + " from " + $result.source_account + " to " + $result.target_account);
        #sayText("Is that correct?");
        wait *;
    }
    transitions
    {
        positive: goto process_transfer on #messageHasIntent("agreement", "positive");
        change_amount: goto transfer_money on #messageHasIntent("differentamt");
        negative: goto transfer_money on #messageHasIntent("agreement", "negative");        
    }
    onexit 
    {
        change_amount: do {
            set $result.amount = "";
            set digression.transfer_data.amount = "";
            set digression.transfer_data.source_account = "";
            set digression.transfer_data.target_account = "";
        }
        negative: do {
            set $result.amount = "";
            set $result.source_account = "";
            set $result.target_account = "";
            set digression.transfer_data.amount = "";
            set digression.transfer_data.source_account = "";
            set digression.transfer_data.target_account = "";
        }
    }
}

node process_transfer
{
    do
    {
        #say("wait_for_processing");
        set $result.success = #random() > 0.7;
        if($result.success)
        {
            #say("transfer_success");
        }
        else
        {
            #say("transfer_failed");
        }
        exit;
    }
}
