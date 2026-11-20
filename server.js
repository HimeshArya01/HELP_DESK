const express=require('express');

const app=express();

//Get Response
app.get('/',(req,res)=>{
    res.send("Welcome to HelpDesk Api!");
})

app.get('/api/info',(req,res)=>{
    const data=res.json({
        "project":"HelpDesk",
        "message":"It handles Students complaints and request",
        "status":"Project handling platform"
    });
    console.log(data);
})
app.listen(3000,()=>{
    console.log("Server running in port 3000");
})