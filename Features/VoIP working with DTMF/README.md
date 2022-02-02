# VoIP: DTMF usage example

## Description

Dual-tone multi-frequency signaling ([DTMF](https://en.wikipedia.org/wiki/Dual-tone_multi-frequency_signaling)) is a telecommunication signaling system. Commonly it is used to dial telephone numbers or to issue commands to switching systems.

Dasha provides an ability of using it. DTMF codes are transmitted over TCP via [rfc2833](https://datatracker.ietf.org/doc/html/rfc2833).

DTMF signaling may be used inside your application via DSL functions: [sendDTMF](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#senddtmf) and [getDTMF](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#getdtmf) to handle them in your script.

This example simply awaits for DTMF signals sent from your phone and echoes them with voice and with [sounds](https://en.wikipedia.org/wiki/Dual-tone_multi-frequency_signaling#Keypad).

When 4 DTMF signals are sent, the dialogue ends with DSL [#forward](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#forward) function.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Script description

The logic of the dialogue is implemented with the digression that triggers when valid DTMF signal is recieved.
The digression body consists of echoing the DTMF and adding it to the buffer.
When buffer is filled with 4 elements, the dialogue finishes in node `forward`.

In node `forward` the #forward function is called, which emits SIP refer to buffered DTMF code.

## Dialogue example

```
{
  speaker: 'ai',
  text: 'Hi!',
  startTime: 2022-01-26T14:30:20.918Z,
  endTime: 2022-01-26T14:30:21.591Z
}
{
  speaker: 'ai',
  text: 'Type symbols in your phone and I will echo them.',
  startTime: 2022-01-26T14:30:21.593Z,
  endTime: 2022-01-26T14:30:24.031Z
}
{
  speaker: 'human',
  text: 'Sure.',
  startTime: 2022-01-26T14:30:25.812Z,
  endTime: 2022-01-26T14:30:27.015Z
}
{
  speaker: 'ai',
  text: 'Sorry, I can get D T M F signals only',
  startTime: 2022-01-26T14:30:27.019Z,
  endTime: 2022-01-26T14:30:29.772Z
}
{
  speaker: 'ai',
  text: 'Type symbols in your phone and I will echo them.',
  startTime: 2022-01-26T14:30:29.774Z,
  endTime: 2022-01-26T14:30:32.030Z
}
{
  speaker: 'ai',
  text: '6',
  startTime: 2022-01-26T14:30:35.551Z,
  endTime: 2022-01-26T14:30:36.051Z
}
{
  speaker: 'human',
  text: '',
  startTime: 2022-01-26T14:30:35.592Z,
  endTime: 2022-01-26T14:30:36.680Z
}
{
  speaker: 'ai',
  text: '6',
  startTime: 2022-01-26T14:30:37.610Z,
  endTime: 2022-01-26T14:30:38.110Z
}
{
  speaker: 'human',
  text: '',
  startTime: 2022-01-26T14:30:37.612Z,
  endTime: 2022-01-26T14:30:38.740Z
}
{
  speaker: 'ai',
  text: '9',
  startTime: 2022-01-26T14:30:39.868Z,
  endTime: 2022-01-26T14:30:40.311Z
}
{
  speaker: 'human',
  text: '',
  startTime: 2022-01-26T14:30:39.932Z,
  endTime: 2022-01-26T14:30:41.020Z
}
{
  speaker: 'ai',
  text: 'octothorpe',
  startTime: 2022-01-26T14:30:43.029Z,
  endTime: 2022-01-26T14:30:43.731Z
}
{
  speaker: 'human',
  text: '',
  startTime: 2022-01-26T14:30:43.111Z,
  endTime: 2022-01-26T14:30:44.081Z
}
{
  speaker: 'ai',
  text: 'Forwarding you to given D T M F code ...',
  startTime: 2022-01-26T14:30:44.937Z,
  endTime: 2022-01-26T14:30:47.751Z
}
----
conversation result { result: { forwarded_to: '669#' } }
```