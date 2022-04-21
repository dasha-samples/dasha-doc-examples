const appConfig = {
  formatVersion: "2",
  name: "dasha-blank-demo",
  dialogue: {
    file: "main.dsl",
  },
  nlu: {
    language: "en-US",
    skills: [],
  },
  nlg: {
    type: "phrases",
    file: "phrasemap.json",
    signatureFile: "phrasemap.json",
  },
};

const phrasemap = {
  default: {
    voiceInfo: {
      lang: "en-US",
      speaker: "default",
      speed: 1.0,
    },
    phrases: {},
    types: {},
    macros: {},
  },
};

const mainDslContent = `context {
    input endpoint: string;
    input conversationId: string;
}
external function close_conversation(conversationId: string): empty;
external function process_user_text(conversationId: string, userText: string): string?;
start node root {
    do {
        #connectSafe($endpoint);    
        wait*;
    }
    transitions { step: goto step on true; }
}
node step {
    do {
        var response = external process_user_text($conversationId,#getMessageText());
        if(response is not null) {
            #sayText(response);
            wait *;
        } else {
            #log("Received empty response, closing conversation");
            exit;
        }
        wait*;
    }
    transitions { step: goto step on true; }
}
digression user_hangup {
    conditions { on true priority 100 tags: onclosed; }
    do {
        #log("digression 'user_hangup'");
        external close_conversation($conversationId);
        exit;
    }
}
`;

export const appContents = {
"app.dashaapp": JSON.stringify(appConfig),
  "phrasemap.json": JSON.stringify(phrasemap),
  "main.dsl": mainDslContent,
};
