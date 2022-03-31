# DSL example: Complex logic inside the digression

## Description

(Work on the description is in progress)

### Digressions

The DSL [digressions](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression) mechanism allow to configure handlers for some special cases in dialogue. 
E.g. when user asks a short question during the dialogue, you may want distract from the main line to answer this question and return back to the main dialogue.

Sometimes these distractions (`digressions`) may have pretty complex logic and may require several nodes to implement it.

Since the DSL API allows you to return to the main script only inside the single `digression`, the only option here is to implement complex digression logic inside the block.

### Example description

The current example demonstrates using complex logic inside the `digression`.

For demonstrating purposes Dasha reads an excerpt from the poem "Beowulf".
During the reading you may ask Dasha about the poem to trigger the `digression` `what_poem` with intent `what_poem`.
The intent `what_poem` can be triggered with phrases like `"what poem?"` or `"what is the poem"`.

Once you come into the `digression`, Dasha tells you some information about the poem, asks you several questions.
Then she continues to read or finshes the dialogue depending on answers you have given.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

In this example the voice call is the better option ;)

## Dialogue example

```log
{
  speaker: 'human',
  text: 'hello',
  startTime: 2022-03-31T10:15:02.117Z,
  endTime: 2022-03-31T10:15:03.324Z
}
{
  speaker: 'ai',
  text: "Hi! Let's test complex logic in digressions.",
  startTime: 2022-03-31T10:15:03.329Z,
  endTime: 2022-03-31T10:15:06.097Z
}
{
  speaker: 'ai',
  text: "I'm going to read a poem for you.",
  startTime: 2022-03-31T10:15:06.099Z,
  endTime: 2022-03-31T10:15:07.895Z
}
{
  speaker: 'ai',
  text: 'You can ask me about this poem any time and we will talk about it.',
  startTime: 2022-03-31T10:15:07.898Z,
  endTime: 2022-03-31T10:15:11.234Z
}
{
  speaker: 'ai',
  text: 'Try me!',
  startTime: 2022-03-31T10:15:11.237Z,
  endTime: 2022-03-31T10:15:11.737Z
}
{
  speaker: 'ai',
  text: '...',
  startTime: 2022-03-31T10:15:11.740Z,
  endTime: 2022-03-31T10:15:11.758Z
}
{
  speaker: 'ai',
  text: 'To him an heir was afterward born,',
  startTime: 2022-03-31T10:15:11.762Z,
  endTime: 2022-03-31T10:15:13.557Z
}
{
  speaker: 'ai',
  text: 'a son in his halls, whom heaven sent',
  startTime: 2022-03-31T10:15:14.582Z,
  endTime: 2022-03-31T10:15:16.617Z
}
{
  speaker: 'ai',
  text: 'to favor the folk, feeling their woe',
  startTime: 2022-03-31T10:15:17.795Z,
  endTime: 2022-03-31T10:15:19.837Z
}
{
  speaker: 'ai',
  text: 'that erst they had lacked an earl for leader',
  startTime: 2022-03-31T10:15:21.004Z,
  endTime: 2022-03-31T10:15:23.116Z
}
{
  speaker: 'ai',
  text: 'so long a while; the Lord endowed him,',
  startTime: 2022-03-31T10:15:24.214Z,
  endTime: 2022-03-31T10:15:26.616Z
}
{
  speaker: 'human',
  text: 'what poem',
  startTime: 2022-03-31T10:15:24.157Z,
  endTime: 2022-03-31T10:15:25.480Z
}
{
  speaker: 'ai',
  text: 'This poem is called ... Beowulf.',
  startTime: 2022-03-31T10:15:26.625Z,
  endTime: 2022-03-31T10:15:28.677Z
}
{
  speaker: 'ai',
  text: 'It is an Old English epic poem in the tradition of Germanic heroic legend',
  startTime: 2022-03-31T10:15:28.680Z,
  endTime: 2022-03-31T10:15:32.557Z
}
{
  speaker: 'ai',
  text: 'Do you like it?',
  startTime: 2022-03-31T10:15:32.559Z,
  endTime: 2022-03-31T10:15:33.437Z
}
{
  speaker: 'human',
  text: 'no',
  startTime: 2022-03-31T10:15:35.917Z,
  endTime: 2022-03-31T10:15:36.842Z
}
{
  speaker: 'ai',
  text: 'Would you like to continue?',
  startTime: 2022-03-31T10:15:36.845Z,
  endTime: 2022-03-31T10:15:38.115Z
}
{
  speaker: 'human',
  text: 'yes',
  startTime: 2022-03-31T10:15:40.637Z,
  endTime: 2022-03-31T10:15:41.523Z
}
{
  speaker: 'ai',
  text: 'Ok, we have stopped at row 5 .',
  startTime: 2022-03-31T10:15:41.527Z,
  endTime: 2022-03-31T10:15:43.757Z
}
{
  speaker: 'ai',
  text: 'I shall continue to read now.',
  startTime: 2022-03-31T10:15:43.759Z,
  endTime: 2022-03-31T10:15:45.414Z
}
{
  speaker: 'ai',
  text: '...',
  startTime: 2022-03-31T10:15:45.416Z,
  endTime: 2022-03-31T10:15:45.433Z
}
{
  speaker: 'ai',
  text: 'the Wielder of Wonder, with world’s renown.',
  startTime: 2022-03-31T10:15:45.483Z,
  endTime: 2022-03-31T10:15:48.117Z
}
{
  speaker: 'ai',
  text: 'Famed was this Beowulf: far flew the boast of him,',
  startTime: 2022-03-31T10:15:49.293Z,
  endTime: 2022-03-31T10:15:51.877Z
}
{
  speaker: 'ai',
  text: 'son of Scyld, in the Scandian lands.',
  startTime: 2022-03-31T10:15:52.908Z,
  endTime: 2022-03-31T10:15:55.237Z
}
{
  speaker: 'ai',
  text: 'So becomes it a youth to quit him well',
  startTime: 2022-03-31T10:15:56.321Z,
  endTime: 2022-03-31T10:15:58.553Z
}
{
  speaker: 'human',
  text: 'what poem',
  startTime: 2022-03-31T10:15:58.437Z,
  endTime: 2022-03-31T10:15:59.233Z
}
{
  speaker: 'ai',
  text: 'This poem is called ... Beowulf.',
  startTime: 2022-03-31T10:15:59.734Z,
  endTime: 2022-03-31T10:16:02.297Z
}
{
  speaker: 'ai',
  text: 'It is an Old English epic poem in the tradition of Germanic heroic legend',
  startTime: 2022-03-31T10:16:03.348Z,
  endTime: 2022-03-31T10:16:05.657Z
}
{
  speaker: 'ai',
  text: 'Do you like it?',
  startTime: 2022-03-31T10:16:06.762Z,
  endTime: 2022-03-31T10:16:09.217Z
}
{
  speaker: 'human',
  text: 'yes',
  startTime: 2022-03-31T10:16:10.376Z,
  endTime: 2022-03-31T10:16:12.293Z
}
{
  speaker: 'ai',
  text: 'Would you like to continue?',
  startTime: 2022-03-31T10:16:13.386Z,
  endTime: 2022-03-31T10:16:15.536Z
}
{
  speaker: 'human',
  text: 'no',
  startTime: 2022-03-31T10:16:16.596Z,
  endTime: 2022-03-31T10:16:18.036Z
}
{
  speaker: 'ai',
  text: 'Ok! It was nice to read you a poem.',
  startTime: 2022-03-31T10:16:18.039Z,
  endTime: 2022-03-31T10:16:18.517Z
}
{
  speaker: 'ai',
  text: 'Bye!',
  startTime: 2022-03-31T10:16:17.217Z,
  endTime: 2022-03-31T10:16:18.544Z
}
conversation result { isDigressionTriggered: true }
```
