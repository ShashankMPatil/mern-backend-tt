const mongoose=require("mongoose")

mongoose.connect(process.env.DATABASE_NAME).then(()=>{
    console.log("Connection successfull")
}).catch((e)=>{
    console.log("No connection")
})