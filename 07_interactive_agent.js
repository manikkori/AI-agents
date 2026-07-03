    const Groq = require("groq-sdk");
    require("dotenv").config();
    const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    });

    const readline = require("readline"); //terminal se input lene k liye

    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    });

    //dummy DB
    function getAttendance(student_name) {
    console.log(`[System] : checking Attendance for ${student_name}.`);
    return `${student_name} ki attendance 85% hai.. its really good.`;
    }

    function getExamDate(subject) {
    console.log(`[System] : checking exam date for ${subject}...`);
    return `${subject} exam scheduled for 23 may... `;
    }

    //system propmting / ai ka brain
    let messages = [
    {
        role: "system",
        content:
        "You are a expert University assistent. Give a short and clean answer.",
    },
    ];

    //tools/function
    let myTools = [
    {
        type: "function",
        function: {
        name: "check_attendance",
        description: "Use these tool when checks student attendance.",
        parameters: {
            type: "object",
            properties: {
            student_name: {
                type: "string",
                description: "Student name for example -> Manish, Himanshu , Tony.",
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
            "Use these tool when checking exam date for perticular subject",
        parameters: {
            type: "object",
            properties: {
            subject: {
                type: "string",
                description:
                "subject name for example -> DBMS , computer networks , c++ , science",
            },
            },
            required: ["subject"],
        },
        },
    },
    ];

    //main chat engine
    async function askQuestion() {
    rl.question("\n You : ", async (userInput) => {
        if (userInput.toLowerCase() === "exit") {
        console.log("AGENT : Bye! See yaa...!");
        rl.close();
        return;
        }

        messages.push({
        role: "user",
        content: userInput,
        });

        try {
        // api calling
        const response1 = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: messages,
            tools: myTools,
            tool_choice: "auto",
        });

        const responseMessage = response1.choices[0].message;

        //if ai ne tool mange
        if (responseMessage.tool_calls) {
            messages.push(responseMessage);

            for (const toolCall of responseMessage.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);
            let resultDB = "";

            if (toolCall.function.name === "check_attendance") {
                resultDB = getAttendance(args.student_name);
            } else if (toolCall.function.name === "check_exam_date") {
                resultDB = getExamDate(args.subject);
            }

            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: resultDB,
            });
            }

            const response2 = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: messages,
            });

            const agentReply = response2.choices[0].message.content;

            console.log("[Agent final reply] : ", agentReply);

            messages.push({
                role:"assistant",
                content:agentReply
            })

        } else {
            const normalRes = responseMessage.content;
            console.log("[Agent normal reply] : ", normalRes);
            messages.push({
                role:"assistant",
                content:normalRes,
            });
        }
        } catch (error) {
        console.error("error : ", error.message);
        }

        askQuestion();

    });
    }

    console.log("----------------------------------------------");
    console.log("University agent ready ! (type 'exit' to quit)");
    console.log("----------------------------------------------");

    askQuestion();