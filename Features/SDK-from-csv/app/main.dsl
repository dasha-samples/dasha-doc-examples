context {
    input endpoint: string;
    input coins: number[];
    input operation: "get"|"put";

    output answer: number?;
}

start node root {
    do {
        #connectSafe($endpoint);
        #sayText("Hi! This is virtual A.T.M machine.");
        #sayText("Please, " + $operation + " the following coins:");
        var sum: number = 0;
        for (var c in $coins) {
            set sum += c;
            #sayText(#stringify(c));
        }
        set $answer = sum;
        exit;
    }
}
