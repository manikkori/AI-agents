const Groq = require('groq-sdk')
require('dotenv').config();

const readline = require('readline');

const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY
});

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

//weather function 
async function getWeather(city_name){
    console.log("[Server] : Find city waether.....");
    try{

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${OPENWEATHER_API_KEY}&units=metric`);

        const data = await response.json();
        if(data.cod !== 200){
            return "city not found!"
        };

        return`${city_name} me abhi mausam '${data.weather[0].description}' hai.`

    }catch(error){
        console.log("[Error] : ", error);
        
    }

    
}

async function getTemperature(city_name){
    console.log(`[server] : search ${city_name} temprature... `);
    try{

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        const data = await response.json();

        if(data.cod !==200){
            return "city not found";
        }

        return `${city_name} ka temperature ${data.main.temp}°C hai.`;


    }catch(error){
        console.log("[Error] : " ,  error);
        
    }
    
}

//ststem prompting
let messages = [
    {
        role:"system",
        content:"You are expert weather assistant. give clean and short answers."
    }
];

//tools

let myTools = [
    {
        type:"function",
        function:{
            name:"check_weather",
            description:"Use these tool when checks weather.",
            parameters:{
                type:"object",
                properties:{
                    city_name:{
                        type:"string",
                        description:"City name like -> Hapur, Ghaziyabad / state nme like-> Uttar pradesh",
                    },
                },
                required:["city_name"],
            },
        },
    },
    {
       type:"function",
        function:{
            name:"check_temperature",
            description:"Use these tool when checks temperature.",
            parameters:{
                type:"object",
                properties:{
                    city_name:{
                        type:"string",
                        description:"City name like -> Hapur, Ghaziyabad / state nme like-> Uttar pradesh",
                    },
                },
                required:["city_name"],
            },
        }, 
    }
];


//main cht engine
async function askQuestion(){

    rl.question("\n You : ", async (userInput)=>{
        if(userInput.toLowerCase() === "exit"){
            console.log("Bye.. see Yaa!");
            rl.close();
            return;
            
        }
        messages.push({
            role:"user",
            content:userInput,
        });

        //api calling
        try{

            let agentThinking = true;
            while(agentThinking){

                const response = await groq.chat.completions.create({
                    model:"openai/gpt-oss-20b",
                    messages:messages,
                    tools:myTools,
                    tool_choice:"auto",
                });

                const responseMessage = response.choices[0].message;

                //If AI tool mangta hai too..
                if(responseMessage.tool_calls){
                    messages.push(responseMessage);

                    for(const toolCall of responseMessage.tool_calls){
                        let args = JSON.parse(toolCall.function.arguments);
                        let result = "";

                        if(toolCall.function.name === "check_weather"){
                            result = await getWeather(args.city_name);
                        }
                        else if(toolCall.function.name === "check_temperature"){
                            result = await getTemperature(args.city_name);
                        }
                        
                        messages.push({
                            role:"tool",
                            tool_call_id:toolCall.id,
                            content:result,
                        });
                    }
                }
                else{
                    const agentReply = responseMessage.content;
                    console.log("[Agent Reply] : ",agentReply);

                     messages.push({
                        role:"assistant",
                        content:agentReply,
                     });

                     agentThinking = false;
                    
                }

            }

        }catch(error){
            console.log("[Error] : ", error);
            
        }
        askQuestion();
    });

}

console.log("Weather agent is ready! (type 'exit' to quit).");


askQuestion();