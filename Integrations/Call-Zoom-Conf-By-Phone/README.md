# Call Zoom Conference By Phone example

The current example is aimed to demonstrate using the conversational AI in combination with Zoom.

Here the application made via Dasha platform acts like an arbitrary Zoom user that connects to existing Zoom meeting.

The connection is established via phone number that exposed by Zoom meeting.
Note that this ability takes place only for meetings created by `pro` Zoom account.

After calling the number you provide into the application, Zoom requires our virtual user to provide the `Meeting ID` and - optionally - the `Participant ID`.
These data is sent to Zoom via DTMF signals (see our another example [VoIP working with DTMF](../../Features/VoIP%20working%20with%20DTMF) to learn more).

So, to start this example you need to provide `phone number` and `meeting ID` of Zoom meeting and maybe `participant ID` (see section [run](#run)).

After all data is send and all checks are passed, Dasha awaits `intent` `in_meeting` which is extracted from Zoom's robot phrase `"you are in the meeting now"`. Then the actual conversation is began for our virtual user performed by Dasha.

> Note: also that for this example the `Waiting room` should be disabled in the Zoom meeting settings. Otherwise the bot will start conversation before it actually gets to the meeting.

## Prerequisites

- Zoom conference started from pro-account
- `phone` to join the conference - phone number without leading `+`
- `Meeting ID` of the conference - number

## Installation

1. `npm i`

## Run

This example uses simple CLI to provide input parameters in the application:

```
Usage: index [options] <phone> [m_id] [p_id]

Call zoom meeting via Dasha. Provide your phone and meeting_id to join zoom meeting

Options:
  --m_id <m_id>  Zoom meeting id
  --p_id <p_id>  Zoom participant id
  -h, --help     display help for command
```

To start the example, you need 
- `phone` - phone number of the conferene (without leading `+`)
- `m_id` - id of the zoom meeting (without `#` in the end)

Optionally:
- `p_id` - participant id that will be assigned to you in the meeting

### Examples:

```
node .\index.js 74999516380 --m_id 81312473386 --p_id 123456
```

(same as previous)

```
node .\index.js 74999516380 81312473386 123456
```

(same as previous)
```
node .\index.js 74999516380 --p_id 123456 --m_id 81312473386
```
