# Voice over Internet Protocol overview

The current documentary is created to explain basic terms connected with *Voice over Internet Protocol* ([VoIP](https://en.wikipedia.org/wiki/Voice_over_IP)) and to overview VoIP from the point of view of Dasha platform in a few words.

## VoIP

Dasha applications are often connected with building conversational AI bots, voice communications, voice interfaces, etc. 
Dasha is a cloud platform, that is why we have to deliver voice and multimedia data over the internet.
The VoIP is exactly the technology that allows us to do that.

While the VoIP is the way to transfer multimedia data, the *Session Initiation Protocol* ([SIP](https://en.wikipedia.org/wiki/Session_Initiation_Protocol)) is a protocol that helps enable VoIP systems.
Simply put, SIP is the technology that creates, modifies, and terminates sessions with one or more parties in an IP network.

[SIP trunking](https://en.wikipedia.org/wiki/SIP_trunking) is a service based on Session Initiation Protocol that delivers telephone services to customer.
So, a SIP provider is a company that provides SIP trunking services.

To connect customers, a SIP trunking service uses *SIP trunks* which roughly speaking can be called virtual telephone lines.

Those *SIP trunks* are used to configure your telephony when connecting it to Dasha application.

## Using VoIP in Dasha

By default, Dasha applications use inbound or oubound telephony.
The applications based on using telephony can be used to build [automatic call centers](https://github.com/dasha-samples/automated-hotel-receptionist), [customer feedback surveys](https://github.com/dasha-samples/customer-feedback-survey), etc.

See the [VoIP inbounds](../VoIP%20inbounds) and [VoIP outbounds](../VoIP%20outbounds) demos to learn how to configure telephony in your app.

Also, using the telephony may require using DTMF signals for purposes like forwarding, etc.
See the [VoIP DTMF example](../VoIP%20Using%20DTMF) for the details.

The other important case of using Dasha is creating web and mobile applications.
For these purposes there is an ability of using Dasha via [WebRTC](https://en.wikipedia.org/wiki/WebRTC).
Take a look at our [VoIP WebRTC](../VoIP%20WebRTC) example to learn how you can create your application.
