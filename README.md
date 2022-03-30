# dasha-doc-examples

Code examples for Dasha features, integrations and use cases.

Every example is supposed to be independent and simplified as much as possible due to demonstrate some particular feature or use case.

## Contents (Work In Progress)

[Basic example](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Basic)

Standalone services
 - [NLU Service](Standalone-Services/NLU)
 - [TTS Service](Standalone-Services/TTS/README.md)
   - [Synthesize](Standalone-Services/TTS/Synthesize)
   - [Custom-Speaker](Standalone-Services/TTS/Custom-Speaker)

Features
 - [NLU Intents (simple)](Features/NLU%20Intents%20(simple))
 - [NLU Intents](Features/NLU%20Intents)
 - [NLU Entities (simple)](Features/NLU%20Entities%20(simple))
 - [NLU Entities](Features/NLU%20Entities)
 - [NLU Sentence Types](Features/NLU%20Sentence%20Types)
 - [NLU Full example](Features/NLU%20Full)
 - NLG phrasemaps
   - Random phrase
   - Repeat phrase
   - Passing args to the phrase
 - [DSL Interrupt exiting dialogue](Features/DSL-Interrupt-exiting-dialogue)
 - DSL Blocks
 - DSL Context and local variables, digression properties
 - DSL NLU control
 - DSL NLG control
 - DSL Events
 - DSL Digressions
   - Simple
   - Shared
   - Preprocessor
 - DSL forwarding
 - DSL Multi file
 - DSL Common libraries
   - Answering machine detection
   - Pinging user
   - What to do, if we don't understand
 - DSL Types
   - basic
   - union
   - array
   - object
   - nullable
   - custom
   - compatibility
   - casting
   - special
 - DSL HTTP requests
 - DSL External functions
 - [Voice over IP](Features/VoIP%20overview)
   - [outbound calls](Features/VoIP%20outbounds)
   - [inbound calls](Features/VoIP%20inbounds)
   - [working with DTMF](Features/VoIP%20working%20with%20DTMF)
   - [WebRTC](Features/VoIP%20WebRTC)
 - [SDK overview](Features/SDK%20overview)
 - SDK start single call
 - [SDK conversation data](Features/SDK%20conversation%20data)
   - input
   - output
   - audio record
   - transcription
 - SDK concurrency
 - SDK conversation config
   - Audio
   - Noise volume
   - Call records
 - SDK conversation channels
 - SDK Text To Speech
   - pre-recorded
   - emotions control
   - voice cloning
 - Calling application from model
 - Isolation between application
   - Using groups for isolation
 - Web SDK
 
Integrations
 - [Join Zoom Conference By Phone](Integrations/Call-Zoom-Conf-By-Phone)
 - [Use Dasha application in AWS Lambda](Integrations/AWS-Lambda)
 - [Create in-browser chat with several users](Integrations/Web-Chat-Multiuser)
 - DB
   - CSV file
   - Postgresql
   - Mongo
   - MySQL
 - HTTP
   - Calling HTTP API from your application
   - HTTP Server with Dasha
   - Chat with Dasha on HTTP
   - Talk to Dasha with HTTP
 - Storage
   - Storing call records 
   - Storing call transcription
 - Monitoring
   - Prometheus
   - Logging data

Profiling
 - Sample profile file
