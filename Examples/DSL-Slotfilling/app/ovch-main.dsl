/**
NO custom parsing logic!
NO values validation!
NO paraphrases and repeat variations!
NO multiple slot filling forms
*/
​
​
type Slot = {
    name: string?;  // just name
    // description: string?;
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: string[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
};
​
​
context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;
​
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
​
    money_transfer_slots: {[x:string]:Slot;} = {
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
​
type Filter = {[x:string]:string|boolean;};
type Data = {[x:string]:string;};
​
block GetFirst(dataArrays: Data[][]): string? {
    start node root {
        do {
            for (var dataArray in $dataArrays) {
                for (var data in dataArray)
                    if (data.value is not null) return data.value;
            }
            return null;
        }
    }
}
block GetAll(dataArrays: Data[][]): string[] {
    start node root {
        do {
            var result: string[] = [];
            for (var dataArray in $dataArrays) {
                for (var data in dataArray)
                    if (data.value is not null) result.push(data.value);
            }
            return result;
        }
    }
}
​
external function getObjectKeys(obj: unknown): string[];
external function setSlotsProperty(slots: {[x:string]:Slot;}, slotName: string, slotValue: Slot):{[x:string]:Slot;};
external function getNoConflictsEntities(slot1: Slot, slot2: Slot): string[];
​
​
preprocessor digression slot_parser {
    conditions {on true priority 5000;}

    var slots: {[x:string]:Slot;} = {};
    var currentSlot: Slot? = null;
​
    do {
        var slotNames = external getObjectKeys(digression.slot_parser.slots);
        for (var slotName in slotNames) {
            var parsedData: Data[][] = [];
            var slot = digression.slot_parser.slots[slotName];
            if (slot is null) { #log("slot is null"); goto unexpected_error; }
​
            // if we fullfill concrete slot (currentSlot), then we consider only entities that has no conflicts with currentSlot
            // But anyway, we fullfill all slots, but we filter allowed entities for others and skip entities with the same name
            
            // For example:
            // source_account: {
            //     entities: ["account:source", "bank:source", "account", "bank"],
            // },
            // target_account: {
            //     entities: ["account:target", "bank:target", "account", "bank"],
            // },
            // amount: {
            //     entities: ["numberword"],
            // }
​
            // currentSlot == source_account
            // Then allowed entities are:
            // source_account: {
            //     entities: ["account:source", "bank:source", "account", "bank"],
            // },
            // target_account: {
            //     entities: ["account:target", "bank:target"],
            // },
            // amount: {
            //     entities: ["numberword"],
            // }
​
​
            var entities = slot.entities;
            if (digression.slot_parser.currentSlot is not null){
                if (digression.slot_parser.currentSlot.name != slot.name) {
                    set entities = external getNoConflictsEntities(digression.slot_parser.currentSlot, slot);
                    // return slot2.entities.filter((value) => !slot1.entities.includes(value));
                }
            }
            for (var e in entities) {
                
                var split = e.split(":");
                var eName = split[0];
                if (eName is null) { #log("eName is null"); goto unexpected_error; }
                var eTag = split[1];
​
                var filter: Filter = {value: true, tag: false};
                if (eTag is not null) set filter.tag = eTag;
​
                var values = #messageGetData(eName, filter);
                parsedData.push(values);
            }
            set slot.value = slot.value ?? blockcall GetFirst(parsedData);
            if (slot.values.length() == 0)
                set slot.values = blockcall GetAll(parsedData);
            set digression.slot_parser.slots = external setSlotsProperty(digression.slot_parser.slots, slotName, slot);
        }
        
        return;
    }
    transitions {
        unexpected_error: goto unexpected_error;
    }
}
​
start node root {
    do {
        #log("node 'root'");
        digression disable slot_parser;
        #connectSafe($endpoint);
        #waitForSpeech(1000);
        #sayText("Hello!");
        goto hub;
    }
    transitions {
        hub: goto hub;
    }
}
​
node hub {
    do{
        // we need to enable preprocessor when we expect slot filling
        digression enable slot_parser;
        #sayText("How can I help you?");
​
        // TODO: multiple slot filling
​
        set digression.slot_parser.slots = $money_transfer_slots;
        wait *;
    }
    transitions {
        slot_filler: goto slot_filler on #messageHasIntent("transfer_money");
    }
}
​
​
node slot_filler {
    do {
        var slotNames = external getObjectKeys(digression.slot_parser.slots);
        // log state of slots
        for (var slotName in slotNames) {
            var slot = digression.slot_parser.slots[slotName];
            #log((slot?.name??"") + " -> " + (slot?.value??""));
        }
​
        // find not filled slots
        var notFilledSlots: Slot[] = [];
        for (var slotName in slotNames) {
            var slot = digression.slot_parser.slots[slotName];
            if (slot is null) {#log("slot is null"); goto unexpected_error;}
            if (slot.value is null and slot.required) notFilledSlots.push(slot);
        }
        // if all slots are filled
        if (notFilledSlots.length() == 0) {
            goto slot_confirmation;
        }
        // ask not filled slots one by one in loop
        var currentSlot = notFilledSlots[0];
        if (currentSlot is not null){
            set digression.slot_parser.currentSlot = currentSlot;
            for (var phrase in currentSlot.askPhrases) {
                #sayText(phrase);
            }
        }
        wait *;
    }
    transitions {
        loop: goto slot_filler on true;
        slot_confirmation: goto slot_confirmation;
        unexpected_error: goto unexpected_error;
    }
}
​
​
node unexpected_error {
    do {
        #sayText("Some unexpected shit happened");
        exit;
    }
}
​
digression dont_understand {
    conditions {
        on true priority -100;
    }
    do {
        #log("digression 'dont_understand'");
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        #repeat();
        return;
    }
}
​
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}
​
node slot_confirmation{
    do
    {
        #log("Slots are fullfilled");
        #sayText("Is everything correct?");
        wait *;
    }
    transitions
    {
        positive: goto finish_slot_filling on #messageHasIntent("agreement", "positive");
        // negative: goto transfer_money on #messageHasIntent("agreement", "negative");
    }
    onexit 
    {
    }
}
​
node finish_slot_filling{
    do {
        // money_transfer_slots stay unchanged. Only digression.slot_parser.slots is modified.
        // Do we need modify money_transfer_slots?
        #log($money_transfer_slots);
​
        set $result.source_account = digression.slot_parser.slots.source_account?.value??"";
        set $result.target_account = digression.slot_parser.slots.target_account?.value??"";
        set $result.amount = digression.slot_parser.slots.amount?.value??"";
​
        // TODO: reset slot values
​
        digression disable slot_parser;
        #log("finish_slot_filling");
        exit;
    }
    transitions{
        hub: goto hub on true;
    }
}