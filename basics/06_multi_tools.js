const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({
    apiKey:process.env.GROQ_API_KEY,
});


//dummy DB
//for attendance
function getAttendance(student_name){
    console.log(`[server] : checking attendance for ${student_name}` );
    return `${student_name} ki attendance 85% h. its really good.`
    
}

//for give exam date
function getExamDate(subject){
    console.log(`[server] : checking exam date for ${subject} subject.`);
    return `${subject} ka exam 23may ko scheduled hai.`
    
}

async function main(){

    //system prompting
    let messages=[
        {
            role:"system",
            content:"You are a expert University assistant. give a short and clean answer.",
        },
        {
            role:"user",
            content:"Manik attendance ?."
        },
    ];

    //tools/function
    let myTools =[
        {
            type:"function",
            function:{
                name:"check_attendance",
                description:"Use these tool when a user checks student attendance.",
                parameters:{
                    type:"object",
                    properties:{
                    student_name:{
                        type:"string",
                        description:"student name for example -> Manish , Lalit Anuriya , Shivani.",
                    },
                },
                },
                required:["student_name"],
            },
        },
        {
            type:"function",
            function:{
                name:"check_exam_date",
                description:"Use these tool when checks exam date for perticular subject.",
                parameters:{
                    type:"object",
                    properties:{
                        subject:{
                            type:"string",
                            description:"subject name for example -> C++ , DBMS , Computer networks"
                        },
                    },
                    
                },
                required:["subject"],
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

    //IF ai tool mange
    if(responseMessage.tool_calls){
        messages.push(responseMessage);

        for(const toolCall of responseMessage.tool_calls){

            const args = JSON.parse(toolCall.function.arguments);

            let resultDB = "";

            if(toolCall.function.name === "check_attendance"){
                resultDB = getAttendance(args.student_name);
            }
            else if(toolCall.function.name === "check_exam_date"){
                resultDB = getExamDate(args.subject);
            }

            messages.push({
                role:"tool",
                tool_call_id:toolCall.id,
                content:resultDB,
            });


        }
        //final response
        const finalResponse = await groq.chat.completions.create({
            model:"openai/gpt-oss-20b",
            messages:messages,
        });

        console.log("[Agent response] : " , finalResponse.choices[0].message.content);
        
    }else{

        console.log("[Agent normal response] : " , response.content);
        
    }


}
main();