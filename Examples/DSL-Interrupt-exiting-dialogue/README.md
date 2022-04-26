# DSL example: Interrupt exiting dialogue example

(Work on the description is in progress)

<!-- ## Description

[Feature doc link](https://docs.dasha.ai/en-us/default/current-feature-doc)

Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com)

Overall example description. What is it about? What does current example contain? What files should user look at?

Please, see our [some-important-link](https://docs.dasha.ai/en-us/default/current-feature-doc) for more details.  -->

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Dialogue examples

```log
AI: Hi! Are you ready to test interrupting hangup?
2022-03-30T10:47:09.315Z [application] info node 'greeting'
User: no
AI: Sorry, I did not get it
AI: Hi! Are you ready to test interrupting hangup?
2022-03-30T10:47:15.339Z [application] info digression 'dont_understand'
User: yes
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:47:21.717Z [application] info node 'goodbye'
2022-03-30T10:47:21.728Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
AI: Ok, hangup is interrupted
2022-03-30T10:47:23.757Z [application] info node 'interrupt_hangup'
2022-03-30T10:47:23.759Z [application] info node 'wait_for_interrupt_or_hangup'
2022-03-30T10:47:25.794Z [application] info node 'hangup'
2022-03-30T10:47:26.827Z [conv:93cefb] info conversation complete
conversation result { status: 'Done', num_interrupts: 1 }
```

```log
AI: Hi! Are you ready to test interrupting hangup?
User: yes
2022-03-30T10:53:10.111Z [application] info node 'goodbye'
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:53:10.131Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
2022-03-30T10:53:13.137Z [application] info node 'interrupt_hangup'
2022-03-30T10:53:13.153Z [application] info node 'goodbye'
AI: Ok, hangup is interrupted
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:53:13.290Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
2022-03-30T10:53:15.551Z [application] info node 'interrupt_hangup'
AI: Ok, hangup is interrupted
2022-03-30T10:53:15.562Z [application] info node 'goodbye'
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:53:15.704Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
2022-03-30T10:53:17.592Z [application] info node 'interrupt_hangup'
2022-03-30T10:53:17.605Z [application] info node 'goodbye'
AI: Ok, hangup is interrupted
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:53:17.758Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
2022-03-30T10:53:19.630Z [application] info node 'interrupt_hangup'
AI: Ok, hangup is interrupted
2022-03-30T10:53:19.635Z [application] info node 'goodbye'
AI: Now I'm going to wait for 2 seconds before hangup. Have a nice day! Bye!
2022-03-30T10:53:19.785Z [application] info node 'wait_for_interrupt_or_hangup'
User: wait
2022-03-30T10:53:21.661Z [application] info node 'interrupt_hangup'
AI: Ok, hangup is interrupted
AI: We reached 5interrupts which is maximum number. Bye!
2022-03-30T10:53:21.818Z [application] info node 'hangup'
2022-03-30T10:53:22.200Z [conv:f1020c] info conversation complete
conversation result { status: 'Hangup interrupt count limit exceeded', num_interrupts: 5 }
```


