import "slot-filling-lib/slot-filling.dsl";

type Pizza = {
    kind: string;
    crust: string;
    additionalIngredient: string?;
};

context {
    input endpoint: string;
    input name: string = "William";
    input sirName: string = "Jones";
    input mostCommonPreviousOrder: Pizza = {
        kind: "margarita",
        crust: "thin",
        additionalIngredient: "olives"
    };
    input menu: string[] = ["pepperoni", "margarita", "hawaiian", "manhattan"];
    input ingredients: string[] = ["bacon", "cheddar", "chicken", "onion", "pineapple", "chilli", "olives"];

    output order: {[x:string]:SlotOutput;} = {
        kind: { value: null, values: [] },
        crust: { value: null, values: [] },
        add_ingredient: { value: null, values: [] }
    };
    output userStreet: string = "";
    output userHouseNumt: string = "";
}

start node root {
    do {
        #log("node 'root'");
        #setVadPauseLength(1.2);
        #connectSafe($endpoint);
        #waitForSpeech(1000);

        // goto test_transition;

        goto hub;
    }
    transitions {
        test_transition: goto ask_pizza;
        hub: goto greeting;
    }
}

node greeting {
    do {
        #sayText("Hello, mister " + $sirName +  "!");
        #sayText("We have identified you by your phone number.");
        goto ask_for_fav_pizza;
    }
    transitions {
        ask_for_fav_pizza: goto ask_for_fav_pizza;
    }
}

node ask_for_fav_pizza {
    do {

        // TODO ask $mostCommonPreviousOrder
        #sayText("Would you like to order a margarita as usual? Thin crust, olives?");
        wait*;
    }
    transitions {
        positive: goto ask_address on #messageHasSentiment("positive");
        negative: goto ask_pizza on #messageHasSentiment("negative");
        some_pizza: goto choose_pizza on #messageHasData("pizza_kind") 
                                        or #messageHasData("pizza_crust") 
                                        or #messageHasData("pizza_ingredient") 
                                        or #messageHasIntent("order_pizza") priority 1;
    }
}

node ask_pizza {
    do {
        #sayText("What pizza would you like to order?");
        wait*;
    }
    transitions {
        choose_pizza: goto choose_pizza on true;
    }
}

node choose_pizza {
    do {
        var slots = {
            kind: {
                askPhrases: [{text:"What kind of pizza would you like?"}],
                required: true,
                triggers: {
                    setEntities: ["pizza_kind:add", "pizza_kind"],
                    dropEntities: ["pizza_kind:remove"],
                    dropIntents: ["different_kind"]
                },
                initialValue: $order.kind?.value
            },
            base: {
                askPhrases: [{text:"Would you like base to be thin or thick?"}],
                required: true,
                triggers: {
                    setEntities: ["pizza_base:add", "pizza_base"],
                    dropEntities: ["pizza_base:remove"],
                    dropIntents: ["different_base"]
                },
                initialValue: $order.base?.value
            },
            add_ingredient: {
                askPhrases: [{text:"Would you like to add some ingredient?"}],
                required: false,
                triggers: {
                    setEntities: ["pizza_ingredient:add", "pizza_ingredient"],
                    dropEntities: ["pizza_ingredient:remove"],
                    dropIntents: ["different_ingredient"]
                },
                initialValue: $order.add_ingredient?.value
            }
        };
        var options = {tryFillOnEnter: true, confirmationPhrase: "pizza_confirmation_phrase", exitIntent: null};
        var result = blockcall SlotFilling(slots, options);
        #log(result);
        goto ask_address;
    }
    transitions {
        ask_address: goto ask_address;
    }
}

node ask_address {
    do {
        #sayText("Is the address the same as before?");
        wait*;
    }
    transitions {
        positive: goto ask_payment on #messageHasSentiment("positive");
        negative: goto choose_address on #messageHasSentiment("negative");
        address: goto ask_payment on #messageHasData("street") or #messageHasData("house_num") priority 10;
    }
    onexit {
        address: do {
            set $userStreet = #messageGetData("street")[0]?.value ?? "";
            set $userHouseNumt = #messageGetData("house_num")[0]?.value ?? "";
        }
    }
}

node choose_address {
    do {
        #sayText("Please, tell me your address?");
        wait*;
    }
    transitions {
        address: goto ask_payment on #messageHasData("street") or #messageHasData("house_num");
    }
    onexit {
        address: do {
            set $userStreet = #messageGetData("street")[0]?.value ?? "";
            set $userHouseNumt = #messageGetData("house_num")[0]?.value ?? "";
        }
    }
}

node ask_payment {
    do {
        #sayText("OK, that'll be $25. Now I will send you a text link for payment.");
        goto await_payment;
    }
    transitions {
        await_payment: goto await_payment;
    }
}

node await_payment {
    do {
        #sayText("Thank you, the payment was completed.");
        goto goodbye;
    }
    transitions {
        goodbye: goto goodbye;
    }
}

node goodbye {
    do {
        #sayText("Bye!");
        exit;
    }
}

global digression menu {
    conditions { on #messageHasIntent("what_do_you_have") priority 10; }
    do {
        #sayText("We've got ", repeatMode:"ignore");
        for (var pizza in $menu) {
            if (pizza == $menu[$menu.length() - 1])
                #sayText(" and ", repeatMode:"ignore");
            #sayText(pizza, repeatMode:"ignore");
        }
        #sayText("pizzas on the menu", repeatMode:"ignore");
        #repeat();
        return;
    }
}

global digression what_ingredients {
        conditions { on #messageHasIntent("what_ingredients") priority 10; }
    do {
        #sayText("We've got ", repeatMode:"ignore");
        for (var i in $ingredients) {
            if (i == $ingredients[$ingredients.length() - 1])
                #sayText(" and ", repeatMode:"ignore");
            #sayText(i, repeatMode:"ignore");
        }
        return;
    }
}


global digression dont_understand {
    conditions {
        on true priority -500;
    }
    do {
        #log("digression 'dont_understand'");
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        #repeat();
        return;
    }
}