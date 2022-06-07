library


type Slot = {
    askPhrases: <{phraseId: Phrases;}|{text: string;}>[]; // phrases that will be addressed to user to ask this slot
    required: boolean; // if false we can skip this slot and not fullfill
    triggers: {
        setEntities: string[]; // entities' names and tags that trigger setting the slot value
        dropEntities: string[]; // entities' names and tags that trigger dropping the slot value
        dropIntents: string[]; // intents that trigger dropping the slot value
    };
    initialValue: string?;
    // initialValues: string[];
    /** TODO add property  
    isArray: boolean;
    */
};

type Slots = {[x:string]:Slot;};

type SlotFillingOptions = {
    tryFillOnEnter: boolean;
    confirmationPhrase: Phrases?;
    exitIntent: string?;
};

type SlotOutput = {
    value: string?;  // stores first parsed value
    values: string[];  // stores all parsed values
};
type SlotOutputs = {[x:string]:SlotOutput;};

type SlotFillingResult = {
    slots: SlotOutputs?;
    success: boolean;
};

type Filter = {[x:string]:string|boolean;};
type Data = {[x:string]:string;};
