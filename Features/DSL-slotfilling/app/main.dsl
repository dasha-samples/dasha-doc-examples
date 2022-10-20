/**
state
city
address
zip
*/

/** @TODO
--1. negative + uniqure setting trigger
[AI]    Your address is Rahway, Florida. Is that correct?
[Human] no, moscow
[AI]    Your address is Rahway, Florida. Is that correct?

--2. dropping intent + new setting entity
[AI]    Your address is Rahway, Florida. Is that correct?
[Human] change city from rahway to moscow
[AI]    Your address is Rahway, Florida. Is that correct?

--3.  если есть negative и 
      1 единственное совпадение: дроп // not this
      1 единственное несовпадение: ресет // no, that
      совпадение и несовпадение: дроп + ресет = ресет // not this, that!

4. [AI]    Your address is Rahway, Alabama. Is that correct?
[Human] no
[AI]    Your address is Rahway, Alabama. Is that correct?
*/

type Filter = {[x:string]:string|boolean;};

type NluData = {[x:string]:string;}[] with {
    getValues():string[] {
        var values: string[] = [];
        for (var data in $this) {
            var value = data.value;
            if (value is not null) values.push(value);
        }
        return values;
    }
};

type NluDataValues = string[] with {
    parse(entityName:string, entityTag:string?=null): NluDataValues {
        var filter: Filter = {value: true, tag: false};
        if (entityTag is not null) {
            set filter.tag = entityTag;
        }
        var data: NluData = #messageGetData(entityName, filter);
        set $this = data.getValues();
        return $this;
    }
    getFirstUnequal(value:string?): string? {
        for (var v in $this) {
            if (v != value) return v;
        }
        return null;
    }
    includes(value:string?): boolean {
        for (var v in $this) {
            if (v == value) return true;
        }
        return false;
    }
};

type StatedIntent = { name: string; state: <"positive"|"negative">?; };
type TaggedEntity = { name: string, tag: string?; };
type IntentDescription = StatedIntent | string with {
    parse(): boolean {
        var statedIntent = $this as StatedIntent;
        if (statedIntent is not null) {
            var state: "positive"|"negative" = statedIntent.state ?? "positive";
            return #messageHasIntent(statedIntent.name, state);
        }
        var intent = $this as string;
        if (intent is not null) {
            return #messageHasIntent(intent);
        }
        #assert(false, "unexpected intent format: " + #stringify($this));
        /** @TODO remove this after fixing assert */
        return false;
    }
};
type EntityDescription = TaggedEntity | string with {
    parse(): NluDataValues {
        var taggedEntity = $this as TaggedEntity;
        if (taggedEntity is not null) {
            var filter: Filter = {value: true, tag: false};
            if (taggedEntity.tag is not null) {
                set filter.tag = taggedEntity.tag;
            }
            var data: NluData = #messageGetData(taggedEntity.name, filter);
            return data.getValues();
        }
        var entity = $this as string;
        if (entity is not null) {
            var data: NluData = #messageGetData(entity);
            return data.getValues();
        }
        #assert(false, "unexpected entity format: " + #stringify($this));
        /** @TODO remove this after fixing assert */
        return [];
    }
    isEqual(another: EntityDescription): boolean {
        var taggedThis = $this as TaggedEntity;
        var taggedAnother = another as TaggedEntity;
        if (taggedThis is not null) {
            if (taggedAnother is not null)
            return taggedThis.name == taggedAnother.name && taggedThis.tag == taggedAnother.tag;
        }
        var strThis = $this as string;
        var strAnother = another as string;
        if (strThis is not null && strAnother is not null) {
            return strThis == strAnother;
        }
        return false;
    }
};

/** @TODO rework to handle options 
https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions?searchResult=p67-highlight-0#saytext-blocking-call
*/
type SayOptions = {interruptDelay:number; /**@TODO add other options */};
type PhraseDescription = {phraseId: Phrases;}|{text: string;}|string with {
    say(interruptible: boolean = false, options:SayOptions? = null): boolean {
        if (options is null) {
            set options = {interruptDelay:1 /**@TODO add other options */};
        }
        var phrase = $this as Phrases;
        if (phrase is not null) return #say(phrase);
        var textObject = $this as {text: string;};
        if (textObject is not null) return #sayText(textObject.text);
        var text = $this as string;
        if (text is not null) return #sayText(text);
        #assert(false, "unexpected phrase format: " + #stringify($this));
        /** @TODO remove this after fixing assert */
        return false;
    }
};


type Slot = {
    /** @TODO */
    // result: string? | string[]
    value: string?;
    values: string[];
    setEntities: EntityDescription[];
    dropIntents: IntentDescription[];
    dropEntities: EntityDescription[];
    askPhrases: PhraseDescription[];
    isRequired: boolean;
    isArray: boolean;
} with {
    // extract(): Slot {

    // }
    isEmpty(): boolean {
        if ($this.isArray) {
            return $this.values.length() == 0;
        }
        return $this.value is null;
    }
    /** @TODO maybe return this slot */
    dropValue(): boolean {
        set $this.value = null;
        set $this.values = [];
        return true;
    }
    /** @TODO maybe return this slot */
    setValue(values: string[]): boolean {
        set $this.value = values[0];
        set $this.values = values;
        return true;
    }
    substituteValues(oldValues: string[], newValues: string[]): boolean {
        var result: string[] = [];
        for (var v in $this.values) {
            var found: boolean = false;
            for (var ov in oldValues) {
                if (v == ov) set found = true;
            }
            if (!found) result.push(v);
        }
        result.append(newValues);
        $this.setValue(result);
        return true;
    }
    getIntersection(array: string[]): string[] {
        var intersection: string[] = [];
        for (var v in $this.values) {
            var found: boolean = false;
            for (var av in array) {
                if (v == av) intersection.push(v);
            }
        }
        return intersection;
    }
    getDifference(array: string[]): string[] {
        var difference: string[] = [];
        for (var av in array) {
            var found: boolean = false;
            for (var v in $this.values) {
                if (v == av) set found = true;
            }
            if (!found) difference.push(av);
        }
        return difference;
    }
};

/** @TODO 
1 make this jst SlotFilling 
2 remove describe method - it can and should be done in main context
*/
type UserAddress = 
/** @TODO this is not good */
// {
//     state: Slot?;
//     city: Slot?;
//     // address: string;
//     // zip: string;
// } 
{[x:string]:Slot?;}
with {
    describeSlots(): UserAddress {
        set $this.state = {
            value: null,
            values: [],
            setEntities: ["state"],
            dropIntents: ["diff_state"],
            dropEntities: [],
            askPhrases: ["What state?"],
            isRequired: true,
            isArray: false
        };
        set $this.city = {
            value: null,
            values: [],
            setEntities: ["city"],
            dropIntents: ["diff_city"],
            dropEntities: [],
            askPhrases: ["What city?"],
            isRequired: true,
            isArray: false
        };
        return $this;
    }
    ask(): boolean {
        #log("ask");
        for (var slotName in $this.keys()) {
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return false;
            if (slot.isEmpty() && slot.isRequired) {
                for (var askPhrase in slot.askPhrases) askPhrase.say();
                return true;
            }
        }
        return true;
    }
    extract(): UserAddress {
        #log("extract");

        // var currentSaved: UserAddress = $this;
        var slotToUniqueTriggers = $this.getUniqueSettingTriggers();
        // #log("slotToUniqueTriggers: " + #stringify(slotToUniqueTriggers));
        var anySlotIsModified: boolean = false;

        for (var slotName in $this.keys()) {
            #log("handling slot '" + slotName + "'...");
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return $this;

            // parse new values
            var parsedValues: NluDataValues = [];
            for (var e in slot.setEntities) {
                parsedValues.append(e.parse());
            }
            #log("\tparsed values: " + #stringify(parsedValues));

            var msgHasDropIntent: boolean = false;
            for (var i in slot.dropIntents) {
                set msgHasDropIntent = msgHasDropIntent || i.parse();
            }
            // #log("\tmsgHasDropIntent: " + #stringify(msgHasDropIntent));

            var slotIsModified: boolean = false;
            /** 
            если есть negative И 
                есть совпадение И нет несовпадений: дроп // `not this`
                есть совпадения И есть несовпадения: замена совпадений на несовпадения // `not this, that!`
                нет совпадений И есть несовпадения: ресет // `no, that` - обрабатывается дальше, независимо от наличия негатива
            */
            if (!slotIsModified) {
                var intersection = slot.getIntersection(parsedValues);
                if ((msgHasDropIntent || $this.isNegationMessage()) && intersection.length() > 0) {
                    var difference = slot.getDifference(parsedValues);
                    #log("\tsubstituting '" + #stringify(intersection) + "' by '" + #stringify(difference) + "'");
                    slot.substituteValues(intersection, difference);
                    set slotIsModified = true;
                }
            }

            /*
            если есть выделившиеся entity, которые являются уникальными триггерами, 
            И они не пересекаются с уже засейвленными
            */
            if (!slotIsModified) {
                var slotUniqueTriggers = (slotToUniqueTriggers[slotName]) as EntityDescription[];
                // #log("\tuniqueTriggers " + #stringify(slotUniqueTriggers));
                #assert(slotUniqueTriggers is not null, "unexpected: slotUniqueTriggers object is null");
                /** @TODO remove this after fixing assert */
                if (slotUniqueTriggers is null) return $this;
                var parsedByUniqueTriggers: string[] = [];
                for (var ut in slotUniqueTriggers) {
                    parsedByUniqueTriggers.append(ut.parse());
                }
                var difference = slot.getDifference(parsedByUniqueTriggers);
                if (difference.length() > 0) {
                    #log("\tresetting values '" + #stringify(slot.values) + "' by unique-trigger values '" + #stringify(difference) + "'");
                    slot.setValue(difference);
                    set slotIsModified = true;
                }
            }

            /** @TODO move to above */
            // try drop value by intent
            if (!slotIsModified && msgHasDropIntent) {
                #log("\tdropping slot by intent");
                slot.dropValue();
                set slotIsModified = true;
            }

            if (!slotIsModified && parsedValues.length() > 0 && slot.isEmpty()) {
                #log("\tresetting empty slot");
                slot.setValue(parsedValues);
                set slotIsModified = true;
            }

            // #log("!slotIsModified && $this.isNegationMessage(): " + #stringify(!slotIsModified) + #stringify($this.isNegationMessage()));


            // finally set new slot value
            set $this[slotName] = slot;
            set anySlotIsModified = anySlotIsModified || slotIsModified;
        }

        if (!anySlotIsModified && $this.isNegationMessage()) {
            #log("\tdropping all slots by pure negation");
            $this.dropAllSlots();
            set anySlotIsModified = true;
        }

        // could not do anything
        if (!anySlotIsModified) {
            #log("\tdont understand");
            $this.sayDontUnderstand();
        }

        // #log("extracted: " + #stringify($this));
        $this.logValues();
        return $this;
    }
    
    validate():boolean {
        #log("validate");
        for (var slotName in $this.keys()) {
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return false;
            if (slot.isRequired && slot.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    confirmation(): boolean {
        #log("confirmation");
        #sayText("Your address is " + $this.toString() + ". Is that correct?");
        return true;
    }

    confirmation_validate():boolean {
        #log("confirmation_validate");
        if ($this.isPositiveMessage()) {
            #log("CONFIRMED");
            return true;
        }
        #log("UNCONFIRMED");
        // if ($this.isNegationMessage()) {
        //     $this.dropAllSlots();
        // } else {
            
        // }
        return false;
    }

    toString():string {
        return ($this.city?.value ?? "") + ", " + ($this.state?.value ?? "");
    }

    isNegationMessage(): boolean {
        return #messageHasSentiment("negative") || #messageHasIntent("no");
    }
    isPositiveMessage(): boolean {
        return #messageHasSentiment("positive") || #messageHasIntent("yes");
    }

    getUniqueSettingTriggers(): {[x:string]: EntityDescription[];} {
        var allSettingTriggers: EntityDescription[] = [];
        for (var slotName in $this.keys()) {
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return {};
            
            allSettingTriggers.append(slot.setEntities);
        }
        // #log("allSettingTriggers " + #stringify(allSettingTriggers));
        
        var slotToUniqueTriggers: {[x:string]: EntityDescription[];} = {};
        for (var slotName in $this.keys()) {
            // #log("slot " + slotName);
            var uniqueSettingTriggers: EntityDescription[] = [];
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return {};
            
            for (var trigger in slot.setEntities) {
                // #log("trigger " + #stringify(trigger));
                var numEntries: number = 0;
                for (var t in allSettingTriggers) {
                    if (trigger.isEqual(t)) set numEntries += 1;
                }
                var isUnique: boolean = numEntries == 1;
                if (isUnique) {
                    uniqueSettingTriggers.push(trigger);
                }
            }
            set slotToUniqueTriggers[slotName] = uniqueSettingTriggers;
        }
        return slotToUniqueTriggers;
    }
    dropAllSlots(): boolean {
        #log("dropping all slots");
        for (var slotName in $this.keys()) {
            $this[slotName]?.dropValue();
        }
        return true;
    }
    sayDontUnderstand(): boolean {
        return #sayText("I'm sorry, I did not understand.");
    }
    logValues(): boolean {
        var msgs: string[] = ["extracted"];
        for (var slotName in $this.keys()) {
            var slot = $this[slotName];
            #assert(slot is not null, "unexpected: slot is null");
            /** @TODO remove this after fixing assert */
            if (slot is null) return false;
            var msg: string = "\t" + slotName + " -> ";
            if (slot.isArray) {
                set msg += #stringify(slot.values);
            } else {
                set msg += #stringify(slot.value);
            }
            msgs.push(msg);
        }
        #log(msgs.join("\n"));
        return true;
    }
};

start node root {
    do {
        #connectSafe("chat");
        wait *;
    }
    transitions {
        any: goto next on true;
    }
}

node next {
    do {
        var initialAddress: UserAddress = {state: null, city: null};
        set initialAddress = initialAddress.describeSlots();
        var address = fill UserAddress(initialAddress, {attemptsCount:null, extractOnEntrance:true});
        #log("address: " + #stringify(address));
        exit;
    }
}
