const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({
  apiKey:process.env.GROQ_API_KEY,
});

function checkCampusDB(item_name ,location){
  console.log(`[server] : checking database for ${item_name} in ${location}`);

  if(location.toLowerCase() === "library" && item_name.toLowerCase()==="book"){
    return `Yes! Aapka saman ${item_name} mil chuka h. apni student id dikhao or saman le jao`;
  }else{
    return `nhi aisa koi saman nhi mila!`
  }
  
}

async function main(){

  //system prompting
  let messages=[
    {
      role:"system",
      content:"You are a expert campus helper. give a short and clean answer.",
    },
    {
      role:"user",
      content:"I lost my bottle in the library",

    },
  ];

  //tools / function
  let myTools =[
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
              description:"item name for example -> water bottle , mobile/phones , school bag.",
            },
            location:{
              type:"string",
              description:"location for example -> canteen , library , classes , washroom",
            },
          },
        },
        required:["item_name", "location"],
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

  const responseMessage = response.choices[0].message;

  //IF ai tool mange
  if(responseMessage.tool_calls){

    messages.push(responseMessage);

    for(const toolCall of responseMessage.tool_calls){
      if(toolCall.function.name === "report_lost_item"){

        const args = JSON.parse(toolCall.function.arguments);
        const resultDB = checkCampusDB(args.item_name , args.location);

        messages.push({
          role:"tool",
          tool_call_id:toolCall.id,
          content:resultDB,

        });

      }
    }
    

    //final response
    const finalResponse = await groq.chat.completions.create({
      model:"openai/gpt-oss-120b",
      messages:messages,
      tools:myTools,
      tool_choice:"auto",
    });

    console.log("[Agent final response] : " , finalResponse.choices[0].message.content);
    

  }else{
    console.log("Agent normal response]: ", responseMessage.content);
    
  }

}

main();