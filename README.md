# dasha-doc-examples

Code examples for Dasha features, integrations and use cases.

Every example is supposed to be independent and simplified as much as possible due to demonstrate some particular feature or use case.

## Contents (Work In Progress)

[Basic example](https://github.com/dasha-samples/dasha-doc-examples/tree/main/Basic)

Standalone services
 - NLU Service

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
 - [VoIP overview](Features/VoIP%20overview)
 - [VoIP outbound calls](Features/VoIP%20outbounds)
 - [VoIP inbound calls](Features/VoIP%20inbounds)
 - [VoIP working with DTMF](Features/VoIP%20working%20with%20DTMF)
 - [VoIP WebRTC](Features/VoIP%20WebRTC)
 - SDK concurrency
 - SDK conversation data
   - input
   - output
   - audio record
 - SDK conversation config
   - Audio
   - Noise volume
   - Call records
 - SDK web
 - Text To Speech
   - pre-recorded
   - emotions control
   - voice cloning
 - Calling application from model
 - Isolation between application
   - Using groups for isolation

Integrations
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
