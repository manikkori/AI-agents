const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY,
});

function checkYoutube(youtuber_name){
    console.log(`[Server] : checking youtube channel ${youtuber_name} for see subscriber counts `);
    if(youtuber_name.toLowerCase()==="mrbeast"){
        return "mrBeast have 450M subscriber on youtube";
    }else{
        return "not found the youtube channel for this name";
    }
}

async function main(){
    //system prompting

    let messages=[
        {
            role:"system",
            content:"You are a youtube expert to search youtubers channel subscriber counts.",
        }
        ,{
            role:"user",
            content:"how are you"
        }
    ]


    //tools/function
    let myTools=[
        {
            type:"function",
            function:{
                name:"subscriber_count",
                description:"use these tool when search youtuber subscriber count",
                parameters:{
                    type:"object",
                    properties:{
                        youtuber_name:{
                            type:"string",
                            description:"youtuber name for example-> carryminati , mrbeast , gamerfleet",

                        },
                    },
                },
                required:["youtuber_name"],
            },
        },
    ];

    //api calling
    const response = await groq.chat.completions.create({
        model:"openai/gpt-oss-20b",
        messages:messages,
        tools:myTools,
        tool_choice:"auto",
    });

    const responseMessage = response.choices[0].message;

    //if ai tool mange
    if(responseMessage.tool_calls){
        messages.push(responseMessage);

        for(const toolcall of responseMessage.tool_calls){
            if(toolcall.function.name === "subscriber_count"){
                const args = JSON.parse(toolcall.function.arguments);

                const resultcountSubs = checkYoutube(args.youtuber_name);

                messages.push({
                    role:"tool",
                    tool_call_id:toolcall.id,
                    content:resultcountSubs,
                });
            }
        }

        const finalResponse = await groq.chat.completions.create({
            model:"openai/gpt-oss-20b",
            messages:messages,
            

        });

        console.log("[Agent response]: ", finalResponse.choices[0].message.content);
        
    }else{
        console.log("[AI normal reply]: ", responseMessage.content);
        
    }


}

main();

