library

import "slot-filling-types.dsl";

/**
NO custom parsing logic!
NO values validation!
NO multiple slot filling forms!

ATTENTION
This block uses intent "agreement"
*/


/*
TODO
терминировать слот филлинг по интенту. то есть например интент "я передумал переводить деньги"
*/



block SlotFilling(slots: Slots, 
                  options: SlotFillingOptions={tryFillOnEnter: true, confirmationPhrase:null}
                ): SlotFillingResult {
    
    import "slot-filling-helpers.dsl";

    context {
        /** TODO move to slot_filler as property */
        slotValues: SlotOutputs = {};
    }

    start node root {
        do {
            #log("in slotfilling, slots: " + $slots.keys().join(","));
            for (var key in $slots.keys()) {
                set $slotValues[key] = {value: null, values: []};
            }

            if ($options.tryFillOnEnter) {
                goto initial_filling;
            }
            goto slot_asker;
        }
        transitions {
            unexpected_error: goto unexpected_error;
            initial_filling: goto initial_filling;
            slot_asker: goto slot_asker;
        }
    }

    node unexpected_error {
        do {
            #log("Unexpected behaviour occurred, exiting dialogue");
            return {slots: null, success: false};
        }
    }

    node slot_asker {
        do {
            for (var slotName in $slots.keys()) {
                var slot = $slots[slotName];
                #log(slotName + " -> " + ($slotValues[slotName]?.value??""));
            }
            #log("node 'slot_asker'");
            /** find unfilled slots */
            var unfilledSlotsNames: string[] = [];
            for (var key in $slots.keys()) {
                var slotValues = $slotValues[key];
                if (slotValues is null) {#log("slot is null"); goto unexpected_error;}
                if (slotValues.value is null and ($slots[key])?.required == true) unfilledSlotsNames.push(key);
            }
            /** if all slots are filled */
            if (unfilledSlotsNames.length() == 0) {
                goto slot_confirmation;
            }
            /** ask not filled slots one by one in loop */
            var currentSlotName = unfilledSlotsNames[0];
            set digression.slot_parser.currentSlotName = currentSlotName;
            for (var phrase in (($slots[currentSlotName??""])?.askPhrases ?? [])) {
                var p = phrase as {[x:string]:string;} ?? {};
                var phraseId = p["phraseId"] as Phrases;
                if (phraseId is not null){
                    #say(phraseId);
                } else {
                    var text = p["text"];
                    if (text is null) {#log("asking phrase is invalid"); goto unexpected_error;}
                    #sayText(text);
                }
            }
            wait*;
        }
        transitions {
            loop: goto slot_asker on true;
            slot_confirmation: goto slot_confirmation;
            unexpected_error: goto unexpected_error;
        }
    }

    node slot_confirmation {
        do {
            #log("Slots are fullfilled");
            if ($options.confirmationPhrase is null) {
                goto finish_slot_filling;
            }
            #log("Confirming slot values...");
            var values: {[x:string]:string;} = {};
            for (var key in $slots.keys()) {
                if ($slotValues.value is null)
                set values[key] = $slotValues[key]?.value ?? "";
            }
            #say($options.confirmationPhrase, values);
            wait *;
        }
        transitions {
            finish_slot_filling: goto finish_slot_filling;
            positive: goto finish_slot_filling on #messageHasIntent("agreement", "positive");
            drop_all_slots: goto slot_asker on #messageHasIntent("agreement", "negative");
            drop_some_slots: goto slot_asker on digression.slot_filler.droppedSomeSlots == true;
        }
        onexit {
            drop_all_slots: do {
                #log("Dropping all parsed slots...");
                for (var key in $slots.keys()) {
                    set $slotValues[key] = {value: null, values: []};
                }
            }
        }
    }

    node finish_slot_filling{
        do {
            #log("finish_slot_filling");
            return {slots: $slotValues, success: true};
        }
    }

    node initial_filling {
        do {
            var slotNames = $slots.keys();
            for (var slotName in slotNames) {

                var parsedData: Data[][] = [];
                var slot = $slots[slotName];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }
    
                var setEntities = slot.triggers.setEntities;
                var parsedValues = blockcall ParseEntities(setEntities);
                set $slotValues[slotName] = {value: blockcall GetFirst(parsedValues), values: blockcall GetAll(parsedValues)};
            }
            goto slot_asker;
        }
        transitions {
            slot_asker: goto slot_asker;
            unexpected_error: goto unexpected_error;
        }
    }

    // preprocessors
    preprocessor digression slot_parser {
        conditions {on true priority 5000;}

        var currentSlotName: string? = null;
        var setSlotsValues: SlotOutputs = {};
        var dropSlotsValues: SlotOutputs = {};
        var dropSlots: {[x:string]:boolean;} = {};
    
        do {
            #log("preprocessor 'slot_parser'");
            var currentSlotName = digression.slot_parser.currentSlotName;
            var setSlotsValues = digression.slot_parser.setSlotsValues;
            var dropSlotsValues = digression.slot_parser.dropSlotsValues;
            var dropSlots = digression.slot_parser.dropSlots;
            
            var slotNames = $slots.keys();
            for (var slotName in slotNames) {
                var parsedData: Data[][] = [];
                var slot = $slots[slotName];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }
    
                var setEntities = slot.triggers.setEntities;
                if (currentSlotName is not null && currentSlotName != slotName){
                    set setEntities = blockcall GetArrayIntersection(setEntities, $slots[currentSlotName]?.triggers?.setEntities ?? []);
                }
                var parsedValues = blockcall ParseEntities(setEntities);
                set setSlotsValues[slotName] = {value: blockcall GetFirst(parsedValues), values: blockcall GetAll(parsedValues)};
                
                var dropEntities = slot.triggers.dropEntities;
                set parsedValues = blockcall ParseEntities(dropEntities);
                set dropSlotsValues[slotName] = {value: blockcall GetFirst(parsedValues), values: blockcall GetAll(parsedValues)};

                var dropIntents = slot.triggers.dropIntents;
                // TODO use sentiment parameter
                set dropSlots[slotName] = #messageHasAnyIntent(dropIntents);
            }
            set digression.slot_parser.setSlotsValues = setSlotsValues;
            set digression.slot_parser.dropSlotsValues = dropSlotsValues;
            set digression.slot_parser.dropSlots = dropSlots;
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }

    preprocessor digression slot_filler {
        conditions { on true priority 4000; }
        var droppedSomeSlots: boolean = false;
        do {
            #log("preprocessor 'slot_filler'");
            set digression.slot_filler.droppedSomeSlots = false;
            /** drop if 
                dropping entity is parsed AND its value is equal to saved one 
                OR
                dropping intents are parsed
            */
            var dropSlotsValues = digression.slot_parser.dropSlotsValues;
            var dropSlots = digression.slot_parser.dropSlots;
            for (var key in $slots.keys()) {
                /** dropping entities */
                var slot = $slotValues[key];
                if (slot is null) {#log("slot is null"); goto unexpected_error;}
                if (slot.value == (dropSlotsValues[key])?.value) {
                    #log("Dropping slot '" + key + "'...");
                    set slot.value = null;
                    set digression.slot_filler.droppedSomeSlots = true;
                }
                // TODO handle array values
                /** dropping intents */
                if (dropSlots[key] == true) {
                    #log("Dropping slot '" + key + "'...");
                    set slot = {value: null, values: []};
                    set digression.slot_filler.droppedSomeSlots = true;
                }
                set $slotValues[key] = slot;
            }
            /** set if setting entity is parsed */
            var setSlotsValues = digression.slot_parser.setSlotsValues;
            for (var key in $slots.keys()) {
                var slot = $slotValues[key];
                if (slot is null) {#log("slot is null"); goto unexpected_error;}
                /** ignore value if it is the same as already set */
                set slot.value = slot.value ?? blockcall GetFirstUnequal(digression.mentioned.saved[key]?.value, setSlotsValues[key]?.values ?? []);
                if (slot.values.length() == 0) 
                    set slot.values = blockcall GetAllUnequal(digression.mentioned.saved[key]?.value, setSlotsValues[key]?.values ?? []);
                set $slotValues[key] = slot;
            }
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }

    preprocessor digression mentioned {
        conditions { on true priority 10000; }
        /** stores values that are mentioned */
        var saved: SlotOutputs = {};
        do {
            #log("preprocessor 'mentioned'");
            var saved: SlotOutputs = {};
            for (var key in $slots.keys()) {
                set saved[key] = {value: null, values: []};
            }

            for (var key in $slots.keys()) {
                var slot = $slots[key];
                if (slot is null) { #log("slot is null"); goto unexpected_error; }

                var setEntities = slot.triggers.setEntities;
                var parsed = blockcall ParseEntities(setEntities);
                var parsedValues = blockcall GetAll(parsed);
                if (blockcall IsInArray($slotValues[key]?.value ?? "", parsedValues)) {
                    var s = saved[key];
                    if (s is null) { #log("s is null"); goto unexpected_error; }
                    set s.value = $slotValues[key]?.value ?? "";
                    set saved[key] = s;
                }
            }
            set digression.mentioned.saved = saved;
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }
}



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



                // #log("---");
                // #log(slot.value);
                // #log(digression.mentioned.saved[key]?.value);
                // #log(setSlotsValues[key]?.values ?? []);
                // #log(blockcall GetFirstUnequal(digression.mentioned.saved[key]?.value, setSlotsValues[key]?.values ?? []));
                // #log("===");


