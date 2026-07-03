const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
});

async function main(){

    //system prompting(AI ka brain)
    let messages=[
        {
            role:"system",
            content:"You are a campus lost and found portal helpfull assistent."
        },
        {
            role:"user",
            content:"I lost my water bottle in canteen tomarrow."
        },
    ];

    //tools /functions
    myTools =[
        {
            type:"function",
            function:{
                name:"report_lost_item",
                description:"Use these tool when a student reports a lost item.",
                parameters:{
                    type:"object",
                    properties:{
                        
                        item_name:{
                            type:"string",
                            description:"lost item name for example - lunch box , water bottle and mobile/phone"
                        },
                        location:{
                            type:"string",
                            description:"The place where the item was last seen, for example - library , canteen and seminaar"
                        },

                    },
                    
                },
                required:["item_name" , "location"],
            },
        },
    ];

    //api calling
    const response = await groq.chat.completions.create({
        model:"openai/gpt-oss-120b",
        messages:messages,
        tools:myTools,
        tool_choice:"auto",
    });

    //output
    console.log("[Agent Answer]: ", JSON.stringify(response.choices[0].message.tool_calls , null ,2));
    

}

main()

