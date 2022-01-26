/**

The logic of the dialogue is implemented with the digression that triggers when valid DTMF signal is recieved.
The digression body consists of echoing the DTMF and adding it to the buffer.
When buffer is filled with 4 elements, the dialogue finishes in node `forward`.

In node `forward` the #forward function is called, which emits SIP refer to buffered DTMF code.

*/

context {
    // input parameters (provided outside)
    // phone to call
    input  endpoint: string;

    // output parameters (will be set during the dialogue)
    output result: { forwarded_to: string; } = { forwarded_to: "" };
}


start node root {
    do {
        #log("node 'root'");
        #connectSafe($endpoint);
        // waiting until user says something
        // if nothing happens during 2000 ms, force-start the dialog
        if (#waitForSpeech(2000)) {
            // if speech was detected, wait until any transition can be executed
            wait * ;
        }
        else {
            // immediate unconditional transition 
            goto force_greeting;
        }
    }
    transitions {
        // greeting transition will be executed after calling 'wait*' 
        // and after the system gets any user input
        greeting: goto greeting on true;
        // force_greeting transition will be executer only if it was called in 'do' section
        force_greeting: goto greeting;
    }
}

node greeting {
    do {
        #log("node 'greeting'");
        #sayText("Hi!");
        #sayText("Type symbols in your phone and I will echo them.");
        // wait for digressions to trigger
        wait*;
    }
}

digression dtmf {
    conditions { on #getDTMF() is not null tags: onprotocol; }
    do {
        #log("digression 'dtmf'");
        var data = #getDTMF();
        // return if null (to avoid null checking in below code)
        if (data is null) return;
        #log(data);

        # pronounce recieved dtmf signal
        if (data == "#") #sayText("octothorpe");
        else if (data == "*") #sayText("star");
        else #sayText(data);

        // send same dtmf signal back to user
        #sendDTMF(data);

        // add acquired data to buffer
        set $result.forwarded_to += data;
        if ($result.forwarded_to.length() >= 4) {
            wait*;
        }
        return;
    }
    transitions {
        forward: goto forward on timeout 1000; // wait for last DTMF to come to user
    }
}

node forward {
    do {
        #sayText("Forwarding you to given D T M F code ...");
        // forward to recieved code and end the dialogue
        #forward($result.forwarded_to);
    }
}

// this digression is visited if no other transition can be executed
digression dont_understand {
    conditions {
        // set low priority to avoid triggering on any other transitions
        on true priority -100;
    }
    do {
        #log("digression 'dont_understand'");
        // say phrase that will no be repeated 
        #sayText("Sorry, I can get D T M F signals only", repeatMode:"ignore");
        // repeat last phrase without 'repeatMode:"ignore"' option
        #repeat();
        // return to the node where this digression was triggered
        return;
    }
}

// this digression is handler for event when user hangs up
digression user_hangup {
    conditions {
        on true priority 100 tags: onclosed;
    }
    do {
        #log("digression 'user_hangup'");
        exit;
    }
}
