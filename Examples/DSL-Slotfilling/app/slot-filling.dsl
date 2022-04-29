library

/**
NO custom parsing logic!
NO values validation!
NO paraphrases and repeat variations!
NO multiple slot filling forms!

ATTENTION
This block uses intent "agreement"
*/

/*
TODO
1. нужен rollback (reset) slots в середине сбора слотов,  не только на confirmation. видимо через дигрессии
2. для reset в будущем делать более по умному, с сущностями сразу + с интентами это одновременно работало. потому что если
- нам сразу скажут новое значение
- нам скажут новое значение сразу двух слотов
- будут говорить что то в духе "не 50 а 500". тут видимо тэги понадобятся
*/

/*
TODO
терминировать слот филлинг по интенту. то есть например интент "я передумал переводить деньги"
*/

/*
TODO
разделить слоты на входное и выходное значение
*/

type Slot = {
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: <{phraseId: Phrases;}|{text: string;}>[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
    resetTrigger: string?; // intent that triggers resetting this slot
    /** TODO add property isArray 
    
    */
};

type Slot2 = {
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: <{phraseId: Phrases;}|{text: string;}>[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
    resetTrigger: string?; // intent that triggers resetting this slot
    /** TODO add property isArray 
    
    */
};


type Slots = {[x:string]:Slot;};

type SlotFillingOptions = {
    tryFillOnEnter: boolean;
    confirmationPhrase: Phrases?;
};


/** TODO implement */
type OutputSlot = {};


type SlotFillingResult = {
    slots: Slots?;
    success: boolean;
};

/** TODO implement */
type InnerSlot = {};

block SlotFilling(slots: Slots, 
                  options: SlotFillingOptions={tryFillOnEnter: true, confirmationPhrase:null}
                ): SlotFillingResult {
    type Filter = {[x:string]:string|boolean;};
    type Data = {[x:string]:string;};

    context {
        resetTriggers: string[] = [];
    }

    block GetResetTriggers(slots: {[x:string]:Slot;}): string[] {
        start node root {
            do {
                var result: string[] = [];
                for (var key in $slots.keys()) {
                    var trigger = ($slots[key])?.resetTrigger;
                    if (trigger is not null) {
                        result.push(trigger);
                    }
                }
                return result;
            }
        }
    }
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
    block GetSlotValues(slots: {[x:string]:Slot;}): string[] {
        start node root {
            do {
                var values: string[] = [];
                for (var key in $slots.keys()) {
                    var v = ($slots[key])?.value;
                    if (v is not null) {
                        values.push(v);
                    }
                    return values;
                }
            }
        }
    }
    block GetSlotEntities(slots: {[x:string]:Slot;}): string[] {
        start node root {
            do {
                var entities: string[] = [];
                for (var key in $slots.keys()) {
                    var es = ($slots[key])?.entities;
                    if (es is not null)
                        entities.append(es);
                }
                return entities;
            }
        }
    }
    start node root {
        do {
            #log("in slotfilling, slots: " + $slots.keys().join(","));
            set digression.slot_parser.slots = $slots;
            if ($options.tryFillOnEnter) {
                goto initial_filling;
            }
            goto slot_filler;
        }
        transitions {
            initial_filling: goto initial_filling;
            slot_filler: goto slot_filler;
        }
    }

    
    // TODO get rid of unexpected error
    node unexpected_error {
        do {
            #log("Unexpected behaviour occurred, exiting dialogue");
            return {slots: null, success: false};
        }
    }

    node slot_filler {
        do {
            var slots = digression.slot_parser.slots;
            var slotNames = slots.keys();
            /** log state of slots */
            for (var slotName in slotNames) {
                var slot = slots[slotName];
                #log(slotName + " -> " + (slot?.value??""));
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
                    var p = phrase as {[x:string]:string;} ?? {};
                    var pp = phrase as {phraseId: Phrases;};
                    var phraseId = p["phraseId"] as Phrases;
                    if (phraseId is not null) {
                        #say(phraseId);
                    } else {
                        var text = p["text"];
                        if (text is null) {#log("asking phrase is invalid"); goto unexpected_error;}
                        #sayText(text);
                    }
                }
            }
            wait *;
        } transitions {
            loop: goto slot_filler on true;
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
            for (var key in digression.slot_parser.slots.keys()) {
                // TODO handle required
                // TODO handle value arrays
                set values[key] = digression.slot_parser.slots[key]?.value ?? "";
            }
            #say($options.confirmationPhrase, values);
            wait *;
        }
        transitions {
            positive: goto finish_slot_filling on #messageHasIntent("agreement", "positive");
            drop_all_slots: goto slot_filler on #messageHasIntent("agreement", "negative");
            drop_some_slots: goto slot_filler on #messageHasAnyIntent(blockcall GetResetTriggers($slots));
            finish_slot_filling: goto finish_slot_filling;
        }
        onexit {
            drop_some_slots: do {
                #log("Dropping some parsed slots...");
                for (var key in $slots.keys()) {
                    var trigger = ($slots[key])?.resetTrigger;
                    if (#messageHasIntent(trigger ?? "")) {
                        #log("Dropping slot '" + key + "'...");
                        set digression.slot_parser.slots[key] = $slots[key];
                    }
                }
            }
            drop_all_slots: do {
                #log("Dropping all parsed slots...");
                set digression.slot_parser.slots = $slots;
            }
        }
    }

    node finish_slot_filling{
        do {
            #log("finish_slot_filling");
            return {slots: digression.slot_parser.slots, success: true};
        }
    }

    node initial_filling {
        do {
            #log("initial filing");
            var slots = digression.slot_parser.slots;
            
            var slotNames = slots.keys();
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
    // preprocessors
    preprocessor digression slot_parser {
        conditions {on true priority 5000;}

        var slots: {[x:string]:Slot;} = {};
        var currentSlotName: string? = null;
    
        do {
            var slots = digression.slot_parser.slots;
            var currentSlotName = digression.slot_parser.currentSlotName;
            
            var slotNames = slots.keys();
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
                // TODO move filling to slot_filler
                set slot.value = slot.value ?? blockcall GetFirst(parsedData);
                if (slot.values.length() == 0)
                    set slot.values = blockcall GetAll(parsedData);

                set slots[slotName] = slot;
            }
            set digression.slot_parser.slots = slots;
            return;
        }
        transitions {
            unexpected_error: goto unexpected_error;
        }
    }
    
    // preprocessor digression mentioned {
    //     conditions { on true priority 10000; }
    //     // var savedValues: string[] = []; // or savedSlots
    //     // var newValues: string[] = [];
    //     var slots: string[] = [];
    //     var saved: {} = {}; // TODO make type right
    //     var someSaved: boolean = false;
    //     // var new: boolean = false;
    //     do {
    //         /*
    //         в этой ноде
    //             сбросить свои значения
    //             пройти по слотам
    //             спарсить их entity
    //             если в слоте уже указано спарсенное entity, то:
    //                 добавить в slots: 
    //                     ключ - ключ этого слота, 
    //                     значение - ДРУГОЙ спарсенный элемент, т.е. 1-й или 2-й эл-тт массива (или null)
    //                 добавить в saved:
    //                     ключ - ключ этого слота, 
    //                     значение - совпавший элемент
    //                 выставить someSaved = true

    //         дальше мы попадаем в slot_parser
    //             там делаем все как обычно, только игнорируем mentioned.saved.slot.value

    //         тогда в вызывающей ноде (slot_confirmation или slot_filler):
    //             сделать условие 'negative'+saved
    //             в onexit по этому условию:
    //                 сбросить  слот  // -----(+засеттить)
                    
    //         */



    //         // var currentSlotValues = blockcall GetSlotValues(digression.slot_parser.slots);
    //         // var entities = blockcall GetSlotEntities(digression.slot_parser.slots);
    //         // for (var e in entities) {
    //         //     var split = e.split(":");
    //         //     var eName = split[0];
    //         //     if (eName is null) { #log("eName is null"); goto unexpected_error; }
    //         //     var eTag = split[1];

    //         //     var filter: Filter = {value: true, tag: false};
    //         //     if (eTag is not null) set filter.tag = eTag;

    //         //     var values = #messageGetData(eName, filter);

    //         //     parsedData.push(values);
    //         // }
    //     }
        
    //     transitions {
    //         unexpected_error: goto unexpected_error;
    //     }
    // }
    
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
