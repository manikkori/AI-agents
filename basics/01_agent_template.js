const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});
async function main() {

    // system prompting (ai a brain)

    let messages =[
        {
            role:"system",
            content:"You are a smart AI agent(created by Manik ). give a clean and short answer."

        },
        {
            role:"user",
            content:"what is Ai?"
        },
    ];

    //tools n functions (this is empty for now)
    myTools = [];

    //api calling

    const response = await groq.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages:messages,
        tools:myTools,
        tool_choice:"auto",
    });

    //printing output

    console.log("Agent's answer -> ", response.choices[0].message.content);

    

}

main();