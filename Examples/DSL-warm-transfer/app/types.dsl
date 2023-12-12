library

type ContentAsyncBlockMessage = { content:unknown;messageType:"Content";sourceRouteId:string;targetRouteId:string; };

type StatusMessage = { status: "operator declined call"|"operator answered"|"operator accepted call"; };

type SipOptions =
{
  FromUser: string?;
  DisplayName: string?;
}
with
{
  attachToOptions(options:
  {
    [x:string]:string;
  }
  ):
  {
    [x:string]:string;
  }
  {
    if($this.FromUser is not null)
    {
      set options["sip_fromUser"] = $this.FromUser;
    }
    if($this.DisplayName is not null)
    {
      set options["sip_displayName"] = $this.DisplayName;
    }
    return options;
  }
}
;