require("dotenv").config({ path: ".env" });

const DashaVoiceServer = require("./dasha/dasha-voice-server");

const axios = require("axios");

const EXTERNAL_API_URL = `http://localhost:8080`

const DASHA_VOICE_SERVER_PORT = "8090";
// const API_URL = `http://localhost:${PORT}`;


const DASHA_SERVER = process.env.DASHA_SERVER;
const DASHA_APIKEY = process.env.DASHA_APIKEY;
console.log(DASHA_SERVER, DASHA_APIKEY)
const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY ?? 2;

async function main() {
    let dashaServer = new DashaVoiceServer(DASHA_SERVER, DASHA_APIKEY);

    // Sends what user said into your NLU.
    // Return your NLU's response text to be pronounced back to user
    async function processUserText(conversationId, userText) {
        const res = await axios.post(`${EXTERNAL_API_URL}/process_user_input/${conversationId}`, {user_text: userText});
        const {ai_response} = res.data;
        console.log("Got ai response", ai_response)
        return ai_response;
    }
    
    dashaServer.setExternalDialogueModel(processUserText);
    
    dashaServer.on("close-dasha-conversation", async (e) => {
        const {conversationId} = e;
        await axios.post(`${EXTERNAL_API_URL}/close_conversation/${conversationId}`);
    })

    dashaServer.run(DASHA_VOICE_SERVER_PORT, DASHA_CONCURRENCY);
}

main();
