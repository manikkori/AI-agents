const Groq = require("groq-sdk");
require("dotenv").config();
const readline = require("readline");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getGithubProfile(username) {
  console.log(
    `[server] : 'Fetching ${username} GitHub data from the Internet'`,
  );

  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    return `incorrect username!!!`;
  }

  const data =await response.json();

  return `Username: ${data.login}
    Name: ${data.name || "Not provided"}
    Public Repositories: ${data.public_repos}
    Followers: ${data.followers}
    Following: ${data.following}
    Location: ${data.location || "Not provided"}
    Bio: ${data.bio || "No bio written"}
    Account Created: ${data.created_at}`;
}

//system prompting / AI ka brain
let messages = [
  {
    role: "system",
    content:"You are a Tech Assistant. Give short, clean and helpfull answer in English. ",
  },
];

//tools / fuunctions
let myTool = [
  {
    type: "function",
    function: {
      name: "check_github",
      description:
        "Use these tool to fetch real github profile of a user.",
      parameters: {
        type: "object",
        properties: {
          username: {
            type: "string",
            description:
              "Github username like -> manikkori, hiteshchoudhary, codewithharry.",
          },
        },
        required: ["username"],
      },
    },
  },
];

//main chat engine
async function askQuestion() {
  rl.question("\n You : ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Bye.. see yaa!");
      rl.close();

      return;
    }

    messages.push({
      role:"user",
      content:userInput
    });

    try {
      let agentThinking = true;
      while (agentThinking) {
        //api calling
        const response1 = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: messages,
          tools: myTool,
          tool_choice: "auto",
        });

        const responseMessage = response1.choices[0].message;

        //IF AI tool mangta hai to...
        if (responseMessage.tool_calls) {
          messages.push(responseMessage);

          for (const toolCall of responseMessage.tool_calls) {
            let args = JSON.parse(toolCall.function.arguments);
            let result = "";

            if (toolCall.function.name === "check_github") {
              result =await getGithubProfile(args.username);
            }

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          }
        } else {
          const agentReply = responseMessage.content;
          console.log("[Agent reply] : ", agentReply);
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
    askQuestion()
  });
}
console.log("Agent is ready ! (Type 'exit' to quit).");

askQuestion()

