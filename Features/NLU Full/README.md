# NLU: Intents and Entities example

## Description

<!-- [Feature doc link](https://docs.dasha.ai/en-us/default/current-feature-doc) -->

This demo uses intents, entities and sentence types all together.
To explore these features independently, please see docs and demos:
- intents ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Intents))
- entities ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Entities))
- sentency types ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/sentence-types), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Sentence%20Types))

<!-- Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com) -->

<!-- Overall example description. What is it about? What does current example contain? What files should user look at? -->

Other features used in this demo:
- digressions
- preprocessor
- DSL predefined functions

The goal of this demo is to implement automatic bank service for transferring money.
To do that we have to collect several pieces of data from user:
- source account
- target account
- amount of money to transfer

Several intents and entities are constructed to implement semantics. 
As it mentioned in other demos and docs, intents are made to express user's requests and wishes:
- `transfer_money`
- `differentamt`
- `agreement#pos`
- `agreement#neg`

...and entities express the objects to be operated:
- `account` - user's accounts, i.e. `saving` and `deposit`
- `bank` - bank accounts (open set)
- `transfer_item` - trasferring items to be collected: source account, target account, amount of money to transfer
  
This demo is simplified and modified version of our another demo: https://github.com/dasha-samples/dasha-money-transfer-demo.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

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

```
AI: Hello, this is Acme bank. How can I help you?
USER: Yes, please transfer 100 dollars to Wells Fargo
AI: Absolutely, we can assist you with that.
AI: Please, tell me
AI: From what source account would you like to transfer?
USER: What is my source account?
AI: Your source account is not defined yet
AI: From what source account would you like to transfer?
USER: From saving
AI: Awesome! Let's summarize!
AI: Transferring $100 from savings to Wells Fargo
AI: Is that correct?
USER: No
AI: Please, tell me
AI: From what source account would you like to transfer?
AI: and
AI: What is your target account?
USER: 1000 dollars from deposit to Morgan Chase 
AI: Awesome! Let's summarize!
AI: Transferring $1000 from deposit to JPMorgan Chase
AI: Is that correct?
USER: Yes
AI: Wait for a second please while I'm executing the transfer.
AI: Transfer failed. Have a great day!
conversation result {
  result: {
    source_account: 'deposit',
    target_account: 'JPMorgan Chase',
    amount: '1000',
    success: false
  }
}
``