# NLU: Intents and Entities example

## Description

This demo uses intents, entities and sentence types all together.
To explore these features independently, please see docs and demos:
- intents ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Intents))
- entities ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Entities))
- sentency types ([doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/sentence-types), [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Sentence%20Types))

See also [DSL NLU control documentation](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control).

The main goal of this demo is to demonstrate the *connection* between *entities* and *intents*.
As it mentioned in other demos and docs, intents are to express user's requests, wishes and feelings (i.e. intentions). 
At the same time entities often serve as the objects operated by user intentions.
Moreover when creating entities they **must** be marked up (so that they are able to be extracted later). 
This marking up can be done in `includes` sections either in intents or in entities.
That is why the connection between entities and intents can be pretty strong.

The model problem is to implement automatic bank service for transferring money.
To do that we have to collect several pieces of data from user:
- source account
- target account
- amount of money to transfer

Let's discuss the building of our nlu model.
Take a look on `app/data.json` file.

We assume that the only thing the user can ask Dasha is to transfer money from on of his accounts (particularly, `saving` or `deposit`) to some another account (his or some bank account) - so we need the intent `transfer_money`.

Also we have to collect the source and target accounts. 
To do that we need entities that represent user accounts (`account` entity) and bank accounts (`bank` entity) - see `app/data.json`.

Pay attention to the `includes` sections of mentioned entities and `transfer_money` intent.
In examples sections you can see that user's request may already contain the source and the target.
To extract this important informations we use *tags* (the ones that follow `:` symbol). 
Actually, using tags is the best way to semantically separate one account (source) from another (target).

The amount of trasfered money is parsed with the pretrained system skill `"common-numbers"` (see `app/app.dashaapp` file).

After the transfer information is collected the user may want to ask or change something.
To change the amount of transferring money there is `differentamt` intent.
To handle user's questions there is `transfer_item` entity that is extracted when user mentions some of the transfer operands.
Combined with *sentence type* extraction `transfer_item` makes possible to handle user's questions about trasfer data.

List of NLU items that are constructed to implement semantics specific for our dialogue model:  \
Intents:
- `transfer_money` - request to transfer money
- `differentamt` - request to change amount of transfered money
- `agreement#pos` - agreement
- `agreement#neg` - disagreement (i.e. agreement with negative state - to learn more about intents states, see [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents) and [demo](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Features/NLU%20Intents))

Entities:
- `account` - user's accounts, i.e. `saving` and `deposit`
- `bank` - bank accounts (open set)
- `transfer_item` - trasfer operands to be collected: source account, target account, amount of money to transfer. In our model it is used to recognize user's questions about the data recognized by Dasha
  
This demo is simplified and modified version of our another big demo: https://github.com/dasha-samples/dasha-money-transfer-demo. 
Feel free to take a look on and explore that one!

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Detailed script description

Other features used in this demo:
- [digressions](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression)
- [preprocessor](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#preprocessor)
- [DSL predefined functions](https://docs.dasha.ai/en-us/default/dasha-script-language/predefined-functions-index)

The scripts generaly consists of 5 nodes:
- `preprocessor digression transfer_data` - preprocessor that implements parsing transfer data logic
- `node transfer_money` - the node where resulting data is set with parsed values. Also it contains logic that checks what data has to be collected further.
- `node transfer_confirmation` - the node for validation collected data
- `digression questions` - digression that triggers when user asks for data that is already recognized by Dasha
- `node process_transfer` - terminal node that implements transfer operation (for simplicity it is just random boolean value)
  
A few words about [preprocessors](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#preprocessor).
Preprocessors are usually used to implement logic that has to be performed before the getting to any node.
That is, in our case the preprocessor `transfer_data` triggers on any user input (see the preprocessor's `conditions` section) and collects recognized data into preprocessors properties.
Particularly, the source and target accounts are extracted from entities `account` and `bank` with corresponding tags.
Like that: `var accounts = #messageGetData("account", { value: true, tag: true });`.
Also, the amount of money is parsed with entity `numberwords`.
Note also setting inital value since preprocessor's purpose is to provide actual information parsed from the last user input.

In the node `transfer_money` the resulting values are checked. 
If they are empty we try to set them with preprocessor's properties.
If values are still empty, then we add additional question about them to motivate user to provide them (but note that there are less than 2 questions per request, otherwise user may become confused).
If everything is filled up, we move to the validation.

In the node `transfer_confirmation` we ask user if parsed information is correct. 
Also there is apportunity to reset the amount of money (`change_amount` transition) or reset all the values (`negative` transition).
If user confirms our data, the dialogue terminates in `process_transfer`.

Also on every step user is free to ask about trasfer data that is already set.
This digression `questions` triggers by condition `on #getSentenceType() == "question" and #messageHasData("transfer_item");`.
Inside the `do` section the set values are checked.
If thet are mentioned by user then the corresponding phrase is said.

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
USER: Transfer money
AI: Absolutely, we can assist you with that.
AI: Please, tell me
AI: From what source account would you like to transfer?
AI: and
AI: What is your target account?
USER: Please transfer 100 dollars to Wells Fargo
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
----
conversation result {
  result: {
    source_account: 'deposit',
    target_account: 'JPMorgan Chase',
    amount: '1000',
    success: false
  }
}
``