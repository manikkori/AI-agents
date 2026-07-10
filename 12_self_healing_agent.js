const Groq = require('groq-sdk');
require('dotenv').config();
const readline = require('readline');
const path = require('path');
const fs = require('fs').promises;

const {exec} = require('child_process'); // Agent background me terminal chala ske
const util = require('util');
const execPromise = util.promisify(exec); //exec ko async/awit ke sath use krne k liye promisify use kiya....


const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY,
});

const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout
});

//tools (agent's handss)
async function createFile(file_name, content){

    console.log(`[Agent] : generating ${file_name}...`);

    try {
        const filePath = path.join(__dirname, file_name);
        await fs.writeFile(filePath, content, "utf-8");
        return `success : file(${file_name}) created successfully.`
    } catch (error) {
        return` error : ${error}`;
    }

}

async function readFile(file_name){
    console.log(`[Agent] : Reading ${file_name}`);
    try {
        const filePath = path.join(__dirname, file_name);
        const content = await fs.readFile(filePath, "utf-8");
        return `file-> ${file_name} data : \n\n ${content}`;
    } catch (error) {
        return` Error : ${error}`;
    }
    
}

//new tool (terminal chalana)
async function executeCommand(command){

    console.log(`[Agent] : Run terminal command -> '${command}'`);
    try {
        const {stdout, stderr} = await execPromise(command);

        if(stderr){
            return `warnings : ${stderr}`

        }

        console.log("[Agent] : Run successfully!");
        return `success! Output : ${stdout}`;
        
    } catch (err) {
        console.log("[Agent] : Code crash!!! wait to fix it.");
        return `crash error! read this error and fix it : ${err.message}`;
        
    }    

}

async function deleteFile(file_name){
    console.log(`[Agent] : Deleting ${file_name}....`);
    try {
        const filePath = path.join(__dirname, file_name);
        await fs.unlink(filePath);
        return `file(${file_name}) deleted successfully! `
    } catch (error) {
        console.log("[Agent] : deletion error ! wait to fix it.");
        return `deletion error fix it ${error.message}`;
        
    }
    
}

//Agent memory & schema

let messages =[
    {
        role:"system",
        content:"You are a senior Developer Agent. You have the ability to read and write files on the user's laptop. You can write the code, save it, and run it in the terminal. If a crash error occurs while running it, don't panic. Read the error message, fix the code, save the file again, and run it once more. Keep doing this until the code runs successfully."
    }
];

let myTools =[
    {
        type:"function",
        function:{
            name:"create_file",
            description:"Use this tool to create new file and overwrite an existing file with code and text  inside the file. ",
            parameters:{
                type:"object",
                properties:{
                    file_name:{
                        type:"string",
                        description:"file name like -> index.html , program.cpp, script.js",
                    },
                    content:{
                        type:"string",
                        description:"The full code or text to write inside the file."
                    },

                },
                required:["file_name", "content"],
            },
        },
    },
    {
        type:"function",
        function:{
            name:"read_file",
            description:"Use this tool to read the content of existing file.",
            parameters:{
                type:"object",
                properties:{
                    file_name:{
                        type:"string",
                        description:"file name like -> index.html , program.cpp, script.js",
                    },
                },
                required:["file_name"],
            },
        },
    },    
    {
        type:"function",
        function:{
            name:"execute_command",
            description:"Use this tool to run a terminal commands to test the code.",
            parameters:{
                type:"object",
                properties:{
                    command:{
                        type:"string",
                        description:"terminal command like -> node script.js, python script.py , start index.html",
                    },
                },
                required:["command"],
            },
        },
    },
    {
        type:"function",
        function:{
            name:"delete_file",
            description:"Use this tool to delete the existing file.",
            parameters:{
                type:"object",
                properties:{
                    file_name:{
                        type:"string",
                        description:"file name like -> index.html , program.cpp, script.js",
                    },
                },
                required:["file_name"],
            },
        },
    },
];


//agentic engine/ main chat engine
async function askQuestion(){

    rl.question("\n You : ", async (userInput)=>{
        if(userInput.toLowerCase() === "exit"){
            console.log("By.. See yaa!");
            rl.close();
            return;
            
        }

        messages.push({
            role:"user",
            content:userInput,
        });

        try {

            let agentThinking = true;
            while(agentThinking){

                //api calling
                const response = await groq.chat.completions.create({
                    model:"openai/gpt-oss-120b",
                    messages:messages,
                    tools:myTools,
                    tool_choice:"auto",
                });

                const responseMessage = response.choices[0].message;

                //IF ai tool mangta hai to...
                if(responseMessage.tool_calls){
                    messages.push(responseMessage);

                    for(const toolCall of responseMessage.tool_calls){
                        
                        const args = JSON.parse(toolCall.function.arguments);
                        let result = "";

                        if(toolCall.function.name === "create_file"){
                            result = await createFile(args.file_name, args.content)
                        }
                        else if(toolCall.function.name === "read_file"){
                            result = await readFile(args.file_name);
                        }
                        else if(toolCall.function.name === "execute_command"){
                            result = await executeCommand(args.command);
                        }
                        else if(toolCall.function.name === "delete_file"){
                            result = await deleteFile(args.file_name);
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
                    console.log("[Agent reply] : " ,agentReply);
                    messages.push({
                        role:"assistant",
                        content:agentReply,
                    });

                    agentThinking = false;
                    
                }

            }

        } catch (error) {
            console.log("[error] : ", error);
            
        }
        askQuestion();
    });

}

console.log("File system developer is ready! (type 'exit' to quit)");

askQuestion();