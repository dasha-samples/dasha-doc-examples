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

Examples
 - [DSL Interrupt exiting dialogue](Examples/DSL-Interrupt-exiting-dialogue)
 - [DSL Handle voicemail, answering machine and operator messages](Examples/DSL-Handle-voicemail-answering-machine)
 - [DSL Complex logic in digression](Examples/DSL-Complex-digression)
 - [DSL Slotfilling](Examples/DSL-Slotfilling)
 - [DSL Warm Transfer](Examples/DSL-warm-transfer/)

Features
 - [NLU Intents (simple)](Features/NLU-Intents-(simple))
 - [NLU Intents](Features/NLU-Intents)
 - [NLU Entities (simple)](Features/NLU-Entities-(simple))
 - [NLU Entities](Features/NLU-Entities)
 - [NLU Sentence Types](Features/NLU-Sentence-Types)
 - [NLU Full example](Features/NLU-Full)
 - NLG phrasemaps
   - Random phrase
   - Repeat phrase
   - Passing args to the phrase
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
 - DSL HTTP requests
 - DSL External functions
 - [Voice over IP](Features/VoIP-overview)
   - [outbound calls](Features/VoIP-outbounds)
   - [inbound calls](Features/VoIP-inbounds)
   - [working with DTMF](Features/VoIP-working-with-DTMF)
   - [WebRTC](Features/VoIP-WebRTC)
 - [SDK overview](Features/SDK-overview)
 - SDK start single call
 - [SDK conversation data](Features/SDK-conversation-data)
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
 - [Use External NLU and Dialogue Model](Integrations/External-NLU-and-DM)
 - [Use Dasha as voice provider for existing text chat](Integrations/Voice-For-External-Web-Chat)
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
