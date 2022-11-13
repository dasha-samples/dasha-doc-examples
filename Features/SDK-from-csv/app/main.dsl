context {
    // input parameters (provided outside)
    // phone to call
    input endpoint: string;
    // input name: {name: string;};
    input coins: number[];

    some: string?;

    output status: string?;
    output anotherStatus: string = "None";
    // output parameters (will be set during the dialogue)
}


start node root {
    do {
        #connectSafe($endpoint);
        #sayText("Hi! This is just a test.");
        for (var c in $coins) {
            #sayText(#stringify(c) + ",");
        }
        exit;
    }
}
