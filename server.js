import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app=express();
app.use(cors());
app.use(express.json({limit:"12mb"}));
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
const model=process.env.OPENAI_MODEL||"gpt-6-luna";

const instructions=`You are Anaya, a friendly personal AI assistant.
Support Hindi and English. Automatically reply in the language the user uses.
You help with general questions, images, creative writing and AI video prompts.
Be useful, natural and concise. Never reveal API keys or private server details.`;

app.post("/api/chat",async(req,res)=>{
  try{
    const {message,image}=req.body;
    const content=[{type:"input_text",text:message||""}];
    if(image) content.push({type:"input_image",image_url:image});
    const r=await client.responses.create({model,instructions,input:[{role:"user",content}]});
    res.json({reply:r.output_text});
  }catch(e){console.error(e);res.status(500).json({error:"Anaya could not respond."});}
});

app.post("/api/video-prompt",async(req,res)=>{
  try{
    const {idea,duration="10 seconds"}=req.body;
    const r=await client.responses.create({
      model,instructions:`${instructions}
For this endpoint, act as a professional AI video prompt writer. Return a ready-to-copy cinematic prompt with camera, lighting, motion, environment, continuity and dialogue when useful. Duration: ${duration}.`,
      input:idea||"Create a cinematic video prompt."
    });
    res.json({prompt:r.output_text});
  }catch(e){res.status(500).json({error:"Could not create video prompt."});}
});

app.post("/api/image-prompt",async(req,res)=>{
  try{
    const {idea}=req.body;
    const r=await client.responses.create({model,instructions:`${instructions}
Create a detailed image-generation prompt from the user's idea. Preserve identity when the user supplies a reference image.`,input:idea});
    res.json({prompt:r.output_text});
  }catch(e){res.status(500).json({error:"Could not create image prompt."});}
});

app.listen(3000,"0.0.0.0",()=>console.log("Anaya Pro running on http://localhost:3000"));
