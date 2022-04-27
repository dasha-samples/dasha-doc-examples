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
    name: string?;  // name used for generating validation phrase
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: string[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
};

type SlotFillingOptions = {
    tryFillOnEnter: boolean;
    confirmationPhrase: Phrases?;
};


block SlotFilling(slots: {[x:string]:Slot;}, 
                  options: SlotFillingOptions={tryFillOnEnter: true, confirmationPhrase:null}
                ): {[x:string]:Slot;} {
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

    // external function getObjectKeys(obj: unknown): string[];
    // external function setSlotsProperty(slots: {[x:string]:Slot;}, slotName: string, slotValue: Slot):{[x:string]:Slot;};
    // external function stringify(obj: unknown): string;
    
    start node root {
        do {
            #log("in slotfilling, slots: " + $slots.keys().join(","));
            set digression.slot_parser.slots = $slots;
            if ($options.tryFillOnEnter) {
                // TODO implement
                goto initial_filling;
            }
            // wait*;
            goto slot_filler;
        }
        transitions {
            initial_filling: goto initial_filling;
            slot_filler: goto slot_filler;
        }
    }


    preprocessor digression slot_parser {
        conditions {on true priority 5000;}

        var slots: {[x:string]:Slot;} = {};
        var currentSlotName: string? = null;
    
        do {
            var slots = digression.slot_parser.slots;
            var currentSlotName = digression.slot_parser.currentSlotName;
            
            var slotNames = slots.keys();
            // var slotNames = external getObjectKeys(slots);
            for (var slotName in slotNames) {
                var parsedData: Data[][] = [];
                var slot = slots[slotName];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }
    
                var entities = slot.entities;
                if (currentSlotName is not null && currentSlotName != slotName){
                    set entities = blockcall GetArrayDiff(slot.entities, slots[currentSlotName]?.entities ?? []);
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

                set slots[slotName] = slot;
                // set digression.slot_parser.slots = external setSlotsProperty(digression.slot_parser.slots, slotName, slot);
            }
            set digression.slot_parser.slots = slots;
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }
    // TODO get rid of unexpected error
    node unexpected_error {
        do {
            #log("Unexpected behaviour occurred, exiting dialogue");
            exit;
        }
    }

    node slot_filler {
        do {
            var slots = digression.slot_parser.slots;
            var slotNames = slots.keys();
            /** log state of slots */
            for (var slotName in slotNames) {
                var slot = slots[slotName];
                #log((slot?.name??"") + " -> " + (slot?.value??""));
            }
            /** find not filled slots */
            var unfilledSlotsNames: string[] = [];
            for (var slotName in slotNames) {
                var slot = slots[slotName];
                if (slot is null) {#log("slot is null"); goto unexpected_error;}
                if (slot.value is null and slot.required) unfilledSlotsNames.push(slotName);
            }
            /** if all slots are filled */
            if (unfilledSlotsNames.length() == 0) {
                goto slot_confirmation;
            }
            /** ask not filled slots one by one in loop */
            var currentSlotName = unfilledSlotsNames[0];
            if (currentSlotName is not null){
                set digression.slot_parser.currentSlotName = currentSlotName;
                for (var phrase in (slots[currentSlotName]?.askPhrases ?? [])) {
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

    node slot_confirmation {
        do
        {
            #log("Slots are fullfilled");
            if ($options.confirmationPhrase is null) {
                goto finish_slot_filling;
            }
            #log("Confirming slot values...");
            var values: {[x:string]:string;} = {};
            for (var key in digression.slot_parser.slots.keys()) {
                set values[key] = digression.slot_parser.slots[key]?.value ?? "";
            }
            #say($options.confirmationPhrase, values);
            wait *;
        }
        transitions
        {
            positive: goto finish_slot_filling on #messageHasIntent("agreement", "positive");
            negative: goto drop_parsed_slots on #messageHasIntent("agreement", "negative");
            finish_slot_filling: goto finish_slot_filling;
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
            #log("finish_slot_filling");
            return digression.slot_parser.slots;
        }
    }

    node initial_filling {
        do {
            #log("initial filing");
            var slots = digression.slot_parser.slots;
            
            var slotNames = slots.keys();
            // var slotNames = external getObjectKeys(slots);
            for (var slotName in slotNames) {
                var parsedData: Data[][] = [];
                var slot = slots[slotName];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }
    
                var entities = slot.entities;
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

                set slots[slotName] = slot;
            }
            set digression.slot_parser.slots = slots;

            goto slot_filler;
        }
        transitions {
            slot_filler: goto slot_filler;
            unexpected_error: goto unexpected_error;
        }
    }

}


