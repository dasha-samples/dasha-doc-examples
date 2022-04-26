library

/**
NO custom parsing logic!
NO values validation!
NO paraphrases and repeat variations!
NO multiple slot filling forms!
*/

/**
if we fullfill concrete slot (currentSlot), then we consider only entities that has no conflicts with currentSlot
But anyway, we fullfill all slots, but we filter allowed entities for others and skip entities with the same name

For example:
source_account: {
    entities: ["account:source", "bank:source", "account", "bank"],
},
target_account: {
    entities: ["account:target", "bank:target", "account", "bank"],
},
amount: {
    entities: ["numberword"],
}

currentSlot == source_account
Then allowed entities are:
source_account: {
    entities: ["account:source", "bank:source", "account", "bank"],
},
target_account: {
    entities: ["account:target", "bank:target"],
},
amount: {
    entities: ["numberword"],
}
*/


type Slot = {
    // TODO remove property 'name'
    name: string?;  // unique name
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: string[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
};

type SlotFillingOptions = {};


block SlotFilling(slots: {[x:string]:Slot;}, options: SlotFillingOptions={}): {[x:string]:Slot;} {
    type Filter = {[x:string]:string|boolean;};
    type Data = {[x:string]:string;};

    context {}

    block GetFirst(dataArrays: Data[][]): string? {
        start node root {
            do {
                for (var dataArray in $dataArrays)
                    for (var data in dataArray)
                        if (data.value is not null) return data.value;
                return null;
            }
        }
    }
    block GetAll(dataArrays: Data[][]): string[] {
        start node root {
            do {
                var result: string[] = [];
                for (var dataArray in $dataArrays)
                    for (var data in dataArray) 
                        if (data.value is not null) result.push(data.value);
                return result;
            }
        }
    }
    block GetArrayDiff(minuend: string[], subtrahend: string[]): string[] {
        block IsInArray(element: string, array: string[]): boolean {
            start node root {
                do {
                    for (var el in $array)
                        if ($element == el) return true;
                    return false;
                }
            }
        }
        start node root {
            do {
                var result: string[] = [];
                for (var s in $minuend) {
                    var includes = blockcall IsInArray(s, $subtrahend);
                    if (!includes)
                        result.push(s);
                }
                return result;
            }
        }
    }
    
    start node root {
        do {
            set digression.slot_parser.slots = $slots;
            
        }
        transitions {
            instant_slot_filler: goto slot_filler;
            slot_filler: goto slot_filler on true;
        }
    }

    preprocessor digression slot_parser {
        conditions {on true priority 5000;}

        var slots: {[x:string]:Slot;} = {};
        // TODO make it just a string (slot key)
        var currentSlot: Slot? = null;
    
        do {
            var slots = digression.slot_parser.slots;
            var currentSlot = digression.slot_parser.currentSlot;
            // var slotNames = external getObjectKeys(digression.slot_parser.slots);
            
            var slotNames = slots.keys();
            for (var slotName in slotNames) {
                var parsedData: Data[][] = [];
                var slot = slots[slotName];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }
    
                var entities = slot.entities;
                // TODO make it only if question was asked
                if (currentSlot is not null && currentSlot.name != slot.name){
                    set entities = blockcall GetArrayDiff(slot.entities, currentSlot.entities);
                }
                for (var e in entities) {
                    var split = e.split(":");
                    var eName = split[0];
                    if (eName is null) { #log("eName is null"); goto unexpected_error; }
                    var eTag = split[1];
    
                    var filter: Filter = {value: true, tag: false};
                    if (eTag is not null) set filter.tag = eTag;
    
                    var values = #messageGetData(eName, filter);
                    parsedData.push(values);
                }
                set slot.value = slot.value ?? blockcall GetFirst(parsedData);
                if (slot.values.length() == 0)
                    set slot.values = blockcall GetAll(parsedData);
                set digression.slot_parser.slots[slotName] = slot;
                // set digression.slot_parser.slots = external setSlotsProperty(digression.slot_parser.slots, slotName, slot);
            }
            
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }
    // TODO get rid of unexpected error
    node unexpected_error {
        do {
            #log("Some unexpected behaviour occurred, exiting dialogue");
            exit;
        }
    }

    node slot_filler {
        do {
            var slotNames = digression.slot_parser.slots.keys();
            // log state of slots
            for (var slotName in slotNames) {
                var slot = digression.slot_parser.slots[slotName];
                #log((slot?.name??"") + " -> " + (slot?.value??""));
            }
    
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

    node slot_confirmation{
        do
        {
            #log("Slots are fullfilled");
            // TODO use provided validation phrase
            #sayText("Is everything correct?");
            wait *;
        }
        transitions
        {
            positive: goto finish_slot_filling on #messageHasIntent("agreement", "positive");
            negative: goto drop_parsed_slots on #messageHasIntent("agreement", "negative");
        }
        onexit 
        {
        }
    }

    node drop_parsed_slots {
        do {
            // TODO implement
            #log("DROP PARSED SLOTS");
            exit;
        }
    }

    node finish_slot_filling{
        do {
            // money_transfer_slots stay unchanged. Only digression.slot_parser.slots is modified.
            // Do we need modify money_transfer_slots?
            #log($slots);
    
            // set $result.source_account = digression.slot_parser.slots.source_account?.value??"";
            // set $result.target_account = digression.slot_parser.slots.target_account?.value??"";
            // set $result.amount = digression.slot_parser.slots.amount?.value??"";
    
            // TODO: reset slot values
    
            digression disable slot_parser;
            #log("finish_slot_filling");
            return $slots;
        }
    }
}


