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
        #log("node 'root'");
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
    var source_account: string = "";
    var target_account: string = "";
    var account: string = "";
    
    do
    {
        #log("preprocessor 'transfer_data'");
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

        set digression.transfer_data.account = #messageGetData("account", { value: true, tag: false })[0]?.value 
                                                ?? #messageGetData("bank", { value: true, tag: false })[0]?.value 
                                                ?? "";

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
        #log("node 'transfer_money'");
        if (#getVisitCount("transfer_money") == 1) #say("will_help");
        
        var needSpecifying = false;
        var questions: string[]  = [];

        if ($result.source_account == "") {
            if (digression.transfer_data.source_account != "") {
                set $result.source_account = digression.transfer_data.source_account;
                set digression.transfer_data.source_account = "";
            } else if (digression.transfer_data.account != "" and $result.target_account != "") {
                set $result.source_account = digression.transfer_data.account;
                set digression.transfer_data.account = "";
            } else {
                set needSpecifying = true;
                questions.push("From what source account would you like to transfer?");
            }
        }
        
        if ($result.target_account == "") {
            if (digression.transfer_data.target_account != "") {
                set $result.target_account = digression.transfer_data.target_account;
                set digression.transfer_data.target_account = "";
            } else if (digression.transfer_data.account != "" and $result.source_account != "") {
                set $result.target_account = digression.transfer_data.account;
                set digression.transfer_data.account = "";
            } else {
                set needSpecifying = true;
                if (questions.length() > 0) questions.push("and");
                questions.push("What is your target account?");
            }
        }
        if ($result.amount == "" and questions.length() < 2) {
            if (digression.transfer_data.amount != "") {
                set $result.amount = digression.transfer_data.amount;
                set digression.transfer_data.amount = "";
            } else {
                set needSpecifying = true;
                if (questions.length() > 0) questions.push("and");
                questions.push("How much money would you like to transfer?");
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
        #log("node 'transfer_confirmation'");
        #sayText("Awesome! Let's summarize!");
        #sayText("Transferring $" + $result.amount + " from " + $result.source_account + " to " + $result.target_account);
        #sayText("Is that correct?", repeatMode:"complement");
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

digression questions {
    conditions {
        on #getSentenceType() == "question" and #messageHasData("transfer_item");
    }
    do {
        #log("digression 'questions'");
        if (#messageHasData("transfer_item", {value: "source_account"})) {
            var msg = "Your source account is ";
            if ($result.source_account != "") {
                set msg += $result.source_account;
            } else {
                set msg += "not defined yet";
            }
            #sayText(msg, repeatMode:"ignore");
        }
        if (#messageHasData("transfer_item", {value: "target_account"})) {
            var msg = "Your target account is ";
            if ($result.target_account != "") {
                set msg += $result.target_account;
            } else {
                set msg += "not defined yet";
            }
            #sayText(msg, repeatMode:"ignore");
        }
        if (#messageHasData("transfer_item", {value: "amount"})) {
            var msg = "Your transfer amount is ";
            if ($result.amount != "") {
                set msg += $result.amount;
            } else {
                set msg += "not defined yet";
            }
            #sayText(msg, repeatMode:"ignore");
        }
        #repeat();
        return;
    }
}

node process_transfer
{
    do
    {
        #log("node 'process_transfer'");
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

// this digression is visited if no other transition can be executed
digression dont_understand {
    conditions {
        // set low priority to avoid triggering on any other transitions
        on true priority -100;
    }
    do {
        #log("digression 'dont_understand'");
        // say phrase that will no be repeated 
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        // repeat last phrase without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

// this digression is handler for event when user hangs up
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}
