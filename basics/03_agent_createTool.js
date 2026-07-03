const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY,
});


async function main(){

    //system prompting
    let messages =[
        {
            role:"system",
            content:"You are a youtube expert. to find subscriber counts of youtubers."
        },
        {
            role:"user",
            content:"How many subscribers does gamerfleet have?",
        }
    ];

    //tool/function
    let mytool =[
        {
            type:"function",
            function:{
                name:"subscriber_count",
                description:"Use this tool when you need to find a YouTuber's subscribers.",
                parameters:{
                    type:"object",
                    properties:{
                        youtuber_name:{
                            type:"string",
                            description:"youtuber name for example -> mrbeast , carryminati , roundtohell ",
                        },
                    },
                },
                require:["youtuber_name"],
            },
        },
    ];

    //api calling
    const response = await groq.chat.completions.create({
        model:"openai/gpt-oss-120b",
        messages:messages,
        tools:mytool,
        tool_choice:"auto",
    });

    //output
    console.log("Agent response-> ", JSON.stringify(response.choices[0].message.tool_calls , null , 2));
    




}

main();