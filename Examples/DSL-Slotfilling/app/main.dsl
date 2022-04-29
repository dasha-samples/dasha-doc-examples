import "slot-filling-lib/slot-filling.dsl";

context {
    input  endpoint: string;
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
        var options = {tryFillOnEnter: true, confirmationPhrase: "slotfilling_confirmation_phrase", exitIntent: null};
        var slots: {[x:string]:Slot;} = {
            source_account: {
                askPhrases: [{text:"From which account you would like to transfer?"}],
                required: true,
                triggers: {
                    setEntities: ["account:source", "bank:source", "account", "bank"],
                    dropEntities: [],
                    dropIntents: []
                }
            },
            target_account: {
                askPhrases: [{phraseId:"ask_target_account"}],
                required: true,
                triggers: {
                    setEntities: ["account:target", "bank:target", "account", "bank"],
                    dropEntities: [],
                    dropIntents: []
                }
            },
            amount: {
                askPhrases: [{phraseId:"ask_amount"}],
                required: true,
                triggers: {
                    setEntities: ["numberword"],
                    dropEntities: [],
                    dropIntents: ["differentamt"]
                }
            }
        };
        var filledSlots = blockcall SlotFilling(slots, options);
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
