# Call Zoom Conference By Phone example

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
Optinally:
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
