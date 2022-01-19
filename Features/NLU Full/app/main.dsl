/**
The scripts generaly consists of 5 nodes:
- `preprocessor digression transfer_data` - preprocessor that implements parsing transfer data logic
- `node transfer_money` - the node where resulting data is set with parsed values. Also it contains logic that checks what data has to be collected further.
- `node transfer_confirmation` - the node for validation collected data
- `digression questions` - digression that triggers when user asks for data that is already recognized by Dasha
- `node process_transfer` - terminal node that implements transfer operation (for simplicity it is just random boolean value)
  
A few words about [preprocessors](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#preprocessor).
Preprocessors are usually used to implement logic that has to be performed before the getting to any node.
That is, in our case the preprocessor `transfer_data` triggers on any user input (see the preprocessor's `conditions` section) and collects recognized data into preprocessors properties.
Particularly, the source and target accounts are extracted from entities `account` and `bank` with corresponding tags.
Like that: `var accounts = #messageGetData("account", { value: true, tag: true });`.
Also, the amount of money is parsed with entity `numberwords`.
Note also setting inital value since preprocessor's purpose is to provide actual information parsed from the last user input.

In the node `transfer_money` the resulting values are checked. 
If they are empty we try to set them with preprocessor's properties.
If values are still empty, then we add additional question about them to motivate user to provide them (but note that there are less than 2 questions per request, otherwise user may become confused).
If everything is filled up, we move to the validation.

In the node `transfer_confirmation` we ask user if parsed information is correct. 
Also there is apportunity to reset the amount of money (`change_amount` transition) or reset all the values (`negative` transition).
If user confirms our data, the dialogue terminates in `process_transfer`.

Also on every step user is free to ask about trasfer data that is already set.
This digression `questions` triggers by condition `on #getSentenceType() == "question" and #messageHasData("transfer_item");`.
Inside the `do` section the set values are checked.
If thet are mentioned by user then the corresponding phrase is said.
*/


context {
    // input parameters (provided outside)
    // phone to call
    input phone: string;

    // output parameters (will be set during the dialogue)
    // resulting object with user parsed and validated data
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

start node root {
    do {
        #log("node 'root'");
        #connectSafe($phone);
        #waitForSpeech(1000);
        #sayText("Hello, this is Acme bank. How can I help you?");
        wait *;
    }
    transitions {
        transfer_money: goto transfer_money on #messageHasIntent("transfer_money");
    }
}

// preprocessor for parsing transfer data items (source account, target account, amount of money)
preprocessor digression transfer_data {
    conditions {
        // triggers on any user input
        on true;
    }
    
    var amount: string = "";
    var source_account: string = "";
    var target_account: string = "";
    var account: string = "";
    
    do
    {
        #log("preprocessor 'transfer_data'");
        // set initials on every user input
        set digression.transfer_data.amount = "";
        set digression.transfer_data.source_account = "";
        set digression.transfer_data.target_account = "";
        set digression.transfer_data.account = "";
        
        // parse numberwords to set amount of transferring money
        set digression.transfer_data.amount = #messageGetData("numberword", { value: true })[0]?.value??"";
        // parse mentioned user accounts and bank accounts
        var accounts = #messageGetData("account", { value: true, tag: true });
        var banks = #messageGetData("bank", { value: true, tag: true });
        // try set source and target from user accounts
        for (var account in accounts) {
            if (account.tag == "source") {
                set digression.transfer_data.source_account = account?.value??"";
            } else if (account.tag == "target") {
                set digression.transfer_data.target_account = account?.value??"";
            }
        }
        // try set source and target from bank accounts
        for (var bank in banks) {
            if (bank.tag == "source") {
                set digression.transfer_data.source_account = bank?.value??"";
            } else if (bank.tag == "target") {
                set digression.transfer_data.target_account = bank?.value??"";
            }
        }
        // set account that could not be parsed with source/target tag
        set digression.transfer_data.account = #messageGetData("account", { value: true, tag: false })[0]?.value 
                                                ?? #messageGetData("bank", { value: true, tag: false })[0]?.value 
                                                ?? "";
        #log({
            parsed_source_account: digression.transfer_data.source_account,
            parsed_target_account: digression.transfer_data.target_account,
            parsed_account: digression.transfer_data.account,
            parsed_amount: digression.transfer_data.amount
        });
        return;
    }
}

node transfer_money {
    do {
        #log("node 'transfer_money'");
        // say this phrase only during the first visit
        if (#getVisitCount("transfer_money") == 1) #sayText("Absolutely, we can assist you with that.");
        
        var needSpecifying = false;
        var questions: string[]  = [];
        // try set result values with values parsed in preprocessor transfer_data
        // if some value (of source_account, target_account, amount) is empty and is not set,
        //   then the corresponding question is asked
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
    transitions {
        provide_data: goto transfer_money on #messageHasIntent("transfer_money") or #messageHasData("bank") or #messageHasData("account") or #messageHasData("numberword");
        confirm: goto transfer_confirmation;
    }
}

node transfer_confirmation {
    do {
        #log("node 'transfer_confirmation'");
        #sayText("Awesome! Let's summarize!");
        #sayText("Transferring $" + $result.amount + " from " + $result.source_account + " to " + $result.target_account);
        #sayText("Is that correct?", repeatMode:"complement");
        wait *;
    }
    transitions {
        positive: goto process_transfer on #messageHasIntent("agreement", "positive");
        change_amount: goto transfer_money on #messageHasIntent("differentamt");
        negative: goto transfer_money on #messageHasIntent("agreement", "negative");        
    }
    onexit {
        change_amount: do {
            set $result.amount = "";
        }
        negative: do {
            set $result.amount = "";
            set $result.source_account = "";
            set $result.target_account = "";
        }
    }
}

digression questions {
    conditions {
        on #getSentenceType() == "question" and #messageHasData("transfer_item");
    }
    do {
        #log("digression 'questions'");
        // if user mentions transfer operand then pronounce its value or 
        //   say that it is not set yet
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
        // repeat last phrase without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

node process_transfer {
    do {
        #log("node 'process_transfer'");
        #sayText("Wait for a second please while I'm executing the transfer.");
        set $result.success = #random() > 0.7;
        if($result.success) {
            #sayText("Transfer is completed. Have a great day!");
        }
        else {
            #sayText("Transfer failed. Have a great day!");
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
