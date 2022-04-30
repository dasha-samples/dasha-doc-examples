## transfer money


**Basic slotfilling**
```log
AI: Hello!
AI: How can I help you?
transfer 1000 dollars
AI: From which account you would like to transfer?
from my savings
AI: What is your target account?
to wells fargo bank
AI: Transferring 1000 from savings to Wells Fargo. Is that correct?
no I've changed my mind
AI: From which account you would like to transfer?
from deposite account to sber bank 1 dollar
AI: Transferring 1 from deposit to sber bank. Is that correct?
yes
2022-04-29T18:02:02.685Z [application] info {"slots":{"source_account":{"value":"deposit","values":["deposit"]},"target_account":{"value":"sber bank 1","values":["sber bank 1"]},"amount":{"value":"1","values":["1"]}},"success":true}
AI: Ok, bye
```

**Resetting value by provided intent (and mentioning value)**
```log
AI: Hello!
AI: How can I help you?
Transfer 1000 from my deposit account to savings
AI: Transferring 1000 from deposit to savings. Is that correct?
actually, can I mentioned 1000 by mistake, can I please change transfer amount 1000 to something else? like 50. It's just... 1000 is my favourite number
AI: Transferring 50 from deposit to savings. Is that correct?
yes
2022-04-29T17:54:27.069Z [application] info {"slots":{"source_account":{"value":"deposit","values":["deposit"]},"target_account":{"value":"savings","values":["savings"]},"amount":{"value":"50","values":["50"]}},"success":true}
AI: Ok, bye
```

**Resetting value by negation and mentioning old and new values**
```log
AI: Hello!
AI: How can I help you?
Transfer 1000 from my deposit account to savings
AI: Transferring 1000 from deposit to savings. Is that correct?
not 1000. I wanted 50
AI: Transferring 50 from deposit to savings. Is that correct?
yep
2022-04-29T18:13:20.865Z [application] info {"slots":{"source_account":{"value":"deposit","values":["deposit"]},"target_account":{"value":"savings","values":["savings"]},"amount":{"value":"50","values":["50"]}},"success":true}
AI: Ok, bye
```

## pizza ordering

