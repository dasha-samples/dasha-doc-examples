const log = [
    {
        speaker: 'human',
        text: 'Fine.'
      },
      {
        speaker: 'ai',
        text: 'Great!'
      },
      {
        speaker: 'ai',
        text: 'Let me connect you to our operator.'
      },
      {
        speaker: 'ai',
        text: 'Waiting for operator to response...'
      },
      {
        speaker: 'ai',
        text: 'Nice weather, huh?'
      },
      {
        speaker: 'human',
        text: 'Yeah.'
      },
      {
        speaker: 'ai',
        text: 'Yeah, I think so too!'
      },
      {
        speaker: 'ai',
        text: 'Did you know that Australia is wider than the moon?'
      },
      {
        speaker: 'ai',
        text: 'Hi, this is Dasha AI bot. I have a user who wants to talk to you right now.'
      },
      {
        speaker: 'ai',
        text: 'Please, wait for a minute, until I provide him some information. I will connect you soon.'
      },
      {
        speaker: 'ai',
        text: 'The user said that he is doing well right now.'
      },
      {
        speaker: 'ai',
        text: 'Are you ready to accept the call?'
      },
      {
        speaker: 'human',
        text: 'Yes.'
      },
      {
        speaker: 'ai',
        text: 'Ok, I am now going to connect the user to you right now. Thank you! Bye.'
      },
      {
        speaker: 'ai',
        text: 'Connecting you to the operator right now.'
      },
      {
        speaker: 'ai',
        text: 'Bye!!'
      }
]

async function main(){
    const mlog = log.map(({speaker, text}) => `[${speaker}] "${text}"`)
    // console.log(JSON.stringify(mlog, null, 1))
    const fs = await import("fs")
    await fs.writeFileSync("transcr", mlog.join("\n"))
    console.log(mlog)
}

main()
