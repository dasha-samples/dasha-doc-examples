import "slot-filling.dsl";

context {
    input  endpoint: string;

    moneyTransferSlots: {[x:string]:Slot;} = {
        source_account: {
            name: "source account",
            value: null,
            values: [],
            entities: ["account:source", "bank:source", "account", "bank"],
            askPhrases: ["From which account you would like to transfer?"],
            required: true
        },
        target_account: {
            name: "target account",
            value: null,
            values: [],
            entities: ["account:target", "bank:target", "account", "bank"], 
            askPhrases: ["What is your target account?"],
            required: true
        },
        amount: {
            name: "amount",
            value: null,
            values: [],
            entities: ["numberword"], 
            askPhrases: ["How much money would you like to transfer?"],
            required: true
        }
    };
}

start node root {
    do {
        #log("node 'root'");
        // digression disable slot_parser;
        #connectSafe($endpoint);
        #waitForSpeech(1000);
        #sayText("Hello!");
        goto hub;
    }
    transitions {
        hub: goto hub;
    }
}

node hub {
    do {
        // we need to enable preprocessor when we expect slot filling
        // digression enable slot_parser;
        #sayText("How can I help you?");

        // TODO: multiple slot filling

        // set digression.slot_parser.slots = $money_transfer_slots;
        wait *;
    }
    transitions {
        transfer_money: goto transfer_money on #messageHasIntent("transfer_money");
    }
}

node transfer_money {
    do {
        var options = {tryFillOnEnter: false, needConfirmation: false, confirmationPhrase:null};
        var filledSlots = blockcall SlotFilling($moneyTransferSlots, options);
        #log("got filled slots:");
        #log(filledSlots);
    }
}

global digression global_robot {
    conditions {
        on #messageHasIntent("are_you_a_robot") priority 1;
    }
    do {
        #sayText("I am global robot", repeatMode:"ignore");
        #repeat();
        return;
    }
}

digression local_robot {
    conditions {
        on #messageHasIntent("are_you_a_robot") priority 1000;
    }
    do {
        #sayText("I am local robot", repeatMode:"ignore");
        #repeat();
        return;
    }
}
