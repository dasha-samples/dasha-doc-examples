/**
NO custom parsing logic!
NO values validation!
NO paraphrases and repeat variations!
*/


type Slot5 = {
    name: string?;  // just name
    // description: string?;
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
    entities: string[]; // defines entities' names and tags
    askPhrases: string[]; // phrases that will be addressed to user to ask this slot
};


context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;

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

type Filter = {[x:string]:string|boolean;};
type Data = {[x:string]:string;};

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

external function getObjectKeys(obj: unknown): string[];
external function setSlotsProperty(slots: {[x:string]:Slot5;}, slotName: string, slotValue: Slot5):{[x:string]:Slot5;};

preprocessor digression slot_parser {
    conditions {on true priority 5000;}

    var slots: {[x:string]:Slot5;} = {
        source_account: {
            name: "source account",
            value: null,
            values: [],
            entities: ["account:source", "bank:source"], // , "account"
            askPhrases: ["What is your source account?"]
        },
        target_account: {
            name: "target account",
            value: null,
            values: [],
            entities: ["account:target", "bank:target"], //, "account"
            askPhrases: ["What is your target account?"]
        }
    };
    do {
        goto transition;
        var slotNames = external getObjectKeys(digression.slot_parser.slots);
        for (var slotName in slotNames) {
            // #log("parsing for slot " + slotName);
            var parsedData: Data[][] = [];
            var slot = digression.slot_parser.slots[slotName];
            if (slot is null) { #log("slot is null"); goto unexpected_error; }
            for (var e in slot.entities) {
                var split = e.split(":");
                var eName = split[0];
                if (eName is null) { #log("eName is null"); goto unexpected_error; }
                var eTag = split[1];
                
                var filter: Filter = {value: true};
                if (eTag is not null) set filter.tag = eTag;
                parsedData.push(#messageGetData(eName, filter));
            }
            set slot.value = slot.value ?? blockcall GetFirst(parsedData);
            if (slot.values.length() == 0)
                set slot.values = blockcall GetAll(parsedData);
            set digression.slot_parser.slots = external setSlotsProperty(digression.slot_parser.slots,slotName,slot);
            // #log(slot);
            // #log(digression.slot_parser.slots);
        }
        
        return;
    }
    transitions {
        unexpected_error: goto unexpected_error;
        transition: goto special_node;
    }
}

start node root {
    do {
        #log("node 'root'");
        digression disable slot_parser;
        #connectSafe($endpoint);
        #waitForSpeech(1000);
        #sayText("Hello!");

        goto start_slot_filling;

    }
    transitions {
        start_slot_filling: goto start_slot_filling;
    }
}

node special_node {
    do {
        #log("SPECIAL");
        wait*;
        // exit;
    }
    transitions {
        aby: goto special_node on true;
    }
}

node start_slot_filling {
    do {
        #sayText("Are you ready to fill some slots?");
        wait *;
    }
    transitions {
        slot_filler: goto slot_filler on true;
    }
}


node slot_filler {
    do {
        digression enable slot_parser;
        var slotNames = external getObjectKeys(digression.slot_parser.slots);
        var phraseBuffer: string[] = [];
        for (var slotName in slotNames) {
            var slot = digression.slot_parser.slots[slotName];
            if (slot is null) {#log("slot is null"); goto unexpected_error;}
            if (slot.value is null) phraseBuffer.append(slot.askPhrases);
        }
        if (phraseBuffer.length() == 0) {
            #log("Slots are fullfilled");
            for (var slotName in slotNames) {
                var slot = digression.slot_parser.slots[slotName];
                #log((slot?.name??"") + " -> " + (slot?.value??""));
            }
            goto start_slot_filling;
        }
        #sayText("Could you please tell me ");
        for (var phrase in phraseBuffer) {
            #sayText(phrase);
        }
        wait*;
    }
    transitions {
        loop: goto slot_filler on true;
        start_slot_filling: goto start_slot_filling;
        unexpected_error: goto unexpected_error;
    }
}

node log_and_loop {
    do {
        #log(#messageGetData("account"));
        wait*;
    }
    transitions {
        loop: goto log_and_loop on true;
    }
}

node unexpected_error {
    do {
        #sayText("Some unexpected shit happened");
        exit;
    }
}

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

digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}






// var o: {[x:string]: unknown;} = {a: 1, b: 2};
// set o.d = 3;
// #log(o);


// type Slot = {
//     value: string?;
//     entityName: string;
//     entityTag: string?;
//     askPhrases: string[];
//     isSingle: boolean;
// };

// type Slot2 = {
//     value: string?;
//     entityNames: string[];
//     entityTags: string[];
//     askPhrases: string[];
//     isSingle: boolean;
// };

// type Slot3 = {
//     value: string?;
//     entities: string[];
//     askPhrases: string[];
//     isSingle: "true";
// };

// type SlotMany = {
//     value: string[];
//     entities: string[];
//     askPhrases: string[];
//     isSingle: "false";
// };

// type Slot4 = {
//     value: string?;
//     values: string[];
//     entities: string[];
//     askPhrases: string[];
// };


        // var sourceAccount = digression.slot_parser.source_account.value;

        // var phraseBuffer: string[] = [];
        // if (sourceAccount is null) {
        //     for (var phrase in digression.slot_parser.source_account.askPhrases) {
        //         phraseBuffer.push(phrase);
        //         // #sayText(phrase);
        //     }
        // } else {
        //     #sayText("Slots are fullfilled");
        //     goto start_slot_filling;
        // }
        // #sayText("Could you please tell me ");
        // for (var phrase in phraseBuffer) {
        //     if (phraseBuffer.length() > 1 && phrase == phraseBuffer[-1]) #sayText(" and ");
        //     #sayText(" " + phrase + " ");
        // }
