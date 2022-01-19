# NLU: Intents and Entities example

## Description

<!-- [Feature doc link](https://docs.dasha.ai/en-us/default/current-feature-doc) -->

This demo uses both intents and entities

[Intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents) [Entities doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities)


Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com)

Overall example description. What is it about? What does current example contain? What files should user look at?

Please, see our [some-important-link](https://docs.dasha.ai/en-us/default/current-feature-doc) for more details. 

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Detailed script description

This section is needed to make code example clear to user. What exactly is going on in the example? How current feature is related to this example?

This section probalby uses other features - they must be mentioned and referenced (references to the docs and demos)

## Dialogue example

```
AI: Hello, this is Acme bank. How can I help you?
USER: I want to transfer 1000 dollars from my deposite account to the JPMorgan Chase bank
AI: Absolutely, we can assist you with that.
AI: Awesome! Let's summarize!
AI: Transferring $1000 from deposit to JPMorgan Chase
AI: Is that correct?
USER: Actually, could you change the transfer amount?
AI: Please, tell me
AI: How much money would you like to transfer?
USER: 500
AI: Awesome! Let's summarize!
AI: Transferring $500 from deposit to JPMorgan Chase
AI: Is that correct?
USER: Yes
AI: Wait for a second please while I'm executing the transfer.
AI: Transfer is completed. Have a great day!
----
conversation result {
  result: {
    source_account: 'deposit',
    target_account: 'JPMorgan Chase',
    amount: '500',
    success: true
  }
}
```

```
AI: Hello, this is Acme bank. How can I help you?
USER: transfer 100 to JPMorgan bank
AI: Absolutely, we can assist you with that.
AI: Please, tell me
AI: From what source account would you like to transfer?
USER: deposit
AI: Awesome! Let's summarize!
AI: Transferring $100 from deposit to JPMorgan bank
AI: Is that correct?
USER: I'm sorry what is my source account again?
AI: Your source account is deposit
AI: Transferring $100 from deposit to JPMorgan bank
AI: Is that correct?
USER: What is my target? 
AI: Your target account is JPMorgan bank
AI: Transferring $100 from deposit to JPMorgan bank
AI: Is that correct?
USER: How much do I transfer?
AI: Sorry, I did not get it
AI: Transferring $100 from deposit to JPMorgan bank
AI: Is that correct?
USER: How much is the transfer amount?
AI: Your transfer amount is 100
AI: Transferring $100 from deposit to JPMorgan bank
AI: Is that correct?
USER: yes
AI: Wait for a second please while I'm executing the transfer.
AI: Transfer failed. Have a great day!
----
conversation result {
  result: {
    source_account: 'deposit',
    target_account: 'JPMorgan bank',
    amount: '100',
    success: false
  }
}
```
