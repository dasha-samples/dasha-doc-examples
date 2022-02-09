# Voice over Internet Protocol overview

The current documentary is created to explain in a few words basic terms connected with *Voice over Internet Protocol* ([VoIP](https://en.wikipedia.org/wiki/Voice_over_IP)). The second goal is to overview VoIP from the point of view of Dasha platform.

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

The *SIP messages* are text-based messasges with the request-response mechanism that are used to transfer data.

The actual data transmission is done by the *Transmission Control Protocol* ([TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)) or the *User Datagram Protocol* ([UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol)). 
The Session Description Protocol ([SDP](https://en.wikipedia.org/wiki/Session_Description_Protocol)) controls which of the protocols is used.

*SIP Header* is a component of a SIP message that contains general information about the SIP message.

In our examples we will mention the [`From`](https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.3) and [`To`](https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.2) SIP headers when talking about the configuration of inbound and outbound telephony.

If you want to explore SIP deeply, read the [SIP documentation](https://datatracker.ietf.org/doc/html/rfc3261).

## Using VoIP in Dasha

By default, Dasha applications use inbound or outbound telephony.
The telephony can be useful for you when you build applicaitons like [automatic call centers](https://github.com/dasha-samples/automated-hotel-receptionist), [customer feedback surveys](https://github.com/dasha-samples/customer-feedback-survey), etc.

See the [VoIP inbounds](../VoIP%20inbounds) and [VoIP outbounds](../VoIP%20outbounds) demos to learn how to configure telephony in your app.

Also, using the telephony may require using DTMF signals for purposes like forwarding, etc.
You can handle the DTMF signals directly in the DSL files of your application.
See the [VoIP DTMF example](../VoIP%20Using%20DTMF) for the details.

The other important case of using Dasha is creating web and mobile applications.
For these purposes there is an ability of using Dasha via [WebRTC](https://en.wikipedia.org/wiki/WebRTC).
Take a look at our [VoIP WebRTC](../VoIP%20WebRTC) example to learn how you can create your application.
