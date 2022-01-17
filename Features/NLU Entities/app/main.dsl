context {
    input phone: string;
    output estimation: number?;
    output feedback: string?;
}


start node root {
    do {
        #connectSafe($phone);
        if (#waitForSpeech(2000)) {
            wait * ;
        }
        else {
            goto force_greeting;
        }
    }
    transitions {
        greeting: goto greeting on true;
        force_greeting: goto greeting;
    }
}

node greeting {
    do {
        #sayText("Hi, this is delivery service quality control department.");
        #sayText("How would you evaluate our service?");
        wait*;
    }
    transitions {
        got_estimation: goto get_feedback on #messageHasData("estimation");
    }
}

digression dont_understand {
    conditions {
        on true priority -100;
    }
    do {
        #sayText("Sorry, I did not get it", repeatMode:"ignore");
        #repeat();
        return;
    }
}

node get_feedback {
    do {
        set $estimation = #messageGetData("estimation")[0]?.value?.parseNumber();
        if ($estimation is not null && $estimation >= 4) {
            set $feedback = "[good] ";
            #sayText("What did you like about our service?");
        } else {
            set $feedback = "[bad] ";
            #sayText("What was wrong about our service?");
        }
        wait*;
    }
    transitions {
        goodbye: goto goodbye on true;
    }
}

node goodbye {
    do {
        if (#messageHasData("service")) {
            var services: string?[] = []; //[#messageGetData("service")[0]?.value];
            for (var s in #messageGetData("service")) {
                services.push(s.value);
            }
            set $feedback = services.join(",") + ": " + #getMessageText();
        } else {
            set $feedback = "other: " + #getMessageText();
        }
        #sayText("Thank you for your attention. Bye!");
        exit;
    }
}