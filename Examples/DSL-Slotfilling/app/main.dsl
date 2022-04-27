import "slot-filling.dsl";

context {
    input  endpoint: string;

    moneyTransferSlots: {[x:string]:Slot;} = {
        source_account: {
            name: "source account",
            value: null,
            values: [],
            entities: ["account:source", "bank:source", "account", "bank"],
            askPhrases: [{text:"From which account you would like to transfer?"}],
            required: true,
            resetTrigger: null
        },
        target_account: {
            name: "target account",
            value: null,
            values: [],
            entities: ["account:target", "bank:target", "account", "bank"], 
            askPhrases: [{phraseId:"ask_target_account"}],
            required: true,
            resetTrigger: null
        },
        amount: {
            name: "amount",
            value: null,
            values: [],
            entities: ["numberword"], 
            askPhrases: [{phraseId:"ask_amount"}],
            required: true,
            resetTrigger: "differentamt"
        }
    };
}

start node root {
    do {
        #log("node 'root'");
        #setVadPauseLength(1.2);
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
        #sayText("How can I help you?");
        wait *;
    }
    transitions {
        transfer_money: goto transfer_money on #messageHasIntent("transfer_money");
    }
}

node transfer_money {
    do {
        var options = {tryFillOnEnter: true, confirmationPhrase: "slotfilling_confirmation_phrase"};
        var filledSlots = blockcall SlotFilling($moneyTransferSlots, options);
        #log("got filled slots:");
        #log(filledSlots);
        #sayText("Ok, bye");
    }
}

/** works in slot filling */
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

/** does not work in slot filling */
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
