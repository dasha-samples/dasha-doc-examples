library

type ContentAsyncBlockMessage = { content:unknown;messageType:"Content";sourceRouteId:string;targetRouteId:string; };

type StatusMessage = { status: "operator declined call"|"operator answered"|"operator accepted call"; };
