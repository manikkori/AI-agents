const Groq = require("groq-sdk");
require("dotenv").config();
const readline = require("readline");
const path = require("path");
const fs = require("fs").promises;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//create/overwrite file functions

async function createFile(file_name, content) {
  console.log(`[Server] : generating ${file_name} .....`);

  try {
    const filePath = path.join(__dirname, file_name);
    await fs.writeFile(filePath, content, "utf-8");
    return ` success : ${file_name} created successfully!`;
  } catch (error) {
    console.log("[Error] : ", error);
  }
}

async function readFile(file_name) {
  console.log(`[Server] : reading ${file_name} .....`);
  try {
    const filePath = path.join(__dirname, file_name);
    const content = await fs.readFile(file_name, "utf-8");
    return `file '${file_name}' data : \n\n ${content}`;
  } catch (error) {
    console.log("[Error] : ", error);
  }
}

//Agent brain / schema
let messages = [
  {
    role: "system",
    content:
      "You are a expert Developer Agent. You have the ability to read and write files on the user's laptop. Whenever the user asks you to handle code or text, use your tools to create or read the files. Do not print unnecessary code to the screen; save it directly to the file. Communicate with the user in English or hinglish user depends.",
  },
];

let myTools = [
  {
    type: "function",
    function: {
      name: "create_file",
      description:
        "Use these tool to create a new file or overwrite an existing file with code or text.",
      parameters: {
        type: "object",
        properties: {
          file_name: {
            type: "string",
            description:
              "Name of the file with extension(e.g. , script.js , index.html, python.py",
          },
          content: {
            type: "string",
            description: "The full code or text to write inside the file",
          },
        },
        required: ["file_name", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Use these tool to read the contents of an existing file.",
      parameters: {
        type: "object",
        properties: {
          file_name: {
            type: "string",
            description:
              "Name of the file with extension(e.g. , script.js , index.html, python.py",
          },
        },
        required: ["file_name"],
      },
    },
  },
];

//Agentic angine / the brain
async function askQuestion() {
  rl.question("\n You : ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("bye... see yaa!");
      rl.close();
      return;
    }

    messages.push({
      role: "user",
      content: userInput,
    });

    console.log("[Agent] : thinking.....");
    

    try {
      let agentThinking = true;
      while (agentThinking) {
        //api calling
        const response = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: messages,
          tools: myTools,
          tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        //IF Ai tool mangta hai to...
        if (responseMessage.tool_calls) {
          messages.push(responseMessage);

          for (const toolCall of responseMessage.tool_calls) {
            let args = JSON.parse(toolCall.function.arguments);
            let result = "";

            if (toolCall.function.name === "create_file") {
              result = await createFile(args.file_name, args.content);
            } else if (toolCall.function.name === "read_file") {
              result = await readFile(args.file_name);
            }

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          }
        } else {
          const agentReply = responseMessage.content;
          console.log("[Agent Reply] : ", agentReply);

          messages.push({
            role: "assistant",
            content: agentReply,
          });

          agentThinking = false;
        }
      }
    } catch (error) {
      console.log("[Error] : ", error);
    }
    askQuestion();
  });
}

console.log("file system Agent is ready. (type 'exit' to quit).");

askQuestion();


