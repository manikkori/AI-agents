const Groq = require("groq-sdk");
require("dotenv").config();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//dummy database
function getAttendance(student_name) {
  console.log(`[server] : checking attendance for ${student_name}`);
  return `${student_name} have 85% attendance. good job!`;
}

function getExamDate(subject_name) {
  console.log(`[server] : checking exam date for ${subject_name}`);
  return `${subject_name} exam is scheduled for 22may.`;
}

function getCourseFee(course_name) {
  console.log(`[server] : checking ${course_name} Fee.`);
  if (course_name.toLowerCase() === "bca") {
    return `${course_name} fee - 80L/year`;
  } else if (course_name.toLowerCase() === "mca") {
    return `${course_name} fee - 1.5L/year`;
  } else if (course_name.toLowerCase() === "b.tech") {
    return `${course_name} fee - 1L/year`;
  } else if (course_name.toLowerCase() === "m.tech") {
    return `${course_name} fee - 1.6L/year`;
  } else if (course_name.toLowerCase() === "bse") {
    return `${course_name} fee - 80L/year`;
  } else if (course_name.toLowerCase() === "bba") {
    return `${course_name} fee - 80L/year`;
  }
}

//system prompting / ai ka brain
let messages = [
  {
    role: "system",
    content:
      "You are a expert University assistent. give clean and short answers.",
  },
];

//tools/ functions
let myTools = [
  {
    type: "function",
    function: {
      name: "check_attendance",
      description: "Use these tool when checks student attendance",
      parameters: {
        type: "object",
        properties: {
          student_name: {
            type: "string",
            description:
              "student name like -> Manish, Arun kumar , Amit tomar.",
          },
        },
        required: ["student_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_exam_date",
      description:
        "Use these tool when checks exam date for perticular subject.",
      parameters: {
        type: "object",
        properties: {
          subject_name: {
            type: "string",
            description:
              "subject name like -> math , science, computer science, DBMS.",
          },
        },
        required: ["subject_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_fee",
      description: "Use these tool when checks course fees.",
      parameters: {
        type: "object",
        properties: {
          course_name: {
            type: "string",
            description: "course name like -> BBA, BCA , B.tech.",
          },
        },
        required: ["course_name"],
      },
    },
  },
];

//main chat engine
async function askQuestion() {
  rl.question("\n You : ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Bye ! , see yaa!");
      rl.close();
      return;
    }

    messages.push({
      role: "user",
      content: userInput,
    });

    try {
      let agentThinking = true;
      while (agentThinking) {
        //api calling
        const response1 = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: messages,
          tools: myTools,
          tool_choice: "auto",
        });

        const responseMessage = response1.choices[0].message;

        //if AI tool mangta hai to..
        if (responseMessage.tool_calls) {
          messages.push(responseMessage);

          for (const toolCall of responseMessage.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);

            let resultDB = "";

            if (toolCall.function.name === "check_attendance") {
              resultDB = getAttendance(args.student_name);
            } else if (toolCall.function.name === "check_exam_date") {
              resultDB = getExamDate(args.subject_name);
            } else if (toolCall.function.name === "check_fee") {
              resultDB = getCourseFee(args.course_name);
            }

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: resultDB,
            });
          }
        } else {
          const normalReply = responseMessage.content;
          console.log("[Agent normal reply] : ", normalReply);

          messages.push({
            role: "assistant",
            content: normalReply,
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

console.log("University assistant ready ! (type 'exit' to quit).");

askQuestion();
