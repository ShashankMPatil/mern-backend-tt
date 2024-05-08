require("dotenv").config()  //keep it always on top
const express=require("express");
const app=express();
const path=require("path");
const hbs=require("hbs");
const bcrypt=require("bcryptjs");
require("./db/conn")
const cookieParser=require("cookie-parser")
const Register=require("./models/registers")
const port=process.env.PORT || 3000;


//FOR STATIC PAGES (WITHOUT USING HANDLEBARS)
const static_path=path.join(__dirname,"../public");//used for static also
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path)) //used for static also

app.set("view engine","hbs");
app.set("views",template_path) //helps to search views folder in templates folder
// console.log(template_path)
// console.log(partials_path)

hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index")
})

app.get("/register",(req,res)=>{
    res.render("register")
})
//CREATING NEW USER
app.post("/register",async (req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.confirmpassword;

        if(password===cpassword){
            const registerEmployee = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword
            })
           
            const token=await registerEmployee.generateAuthToken();
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+600000),
                httpOnly:true
            })
            const registered = await registerEmployee.save();

            res.status(201).render("index")
        }else{
            res.send("Password not matching");
        }


    }catch(error){
        res.status(400).send(error)
    }
})

//LOGIN GET

app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email
        const password=req.body.password
        const useremail=await Register.findOne({email:email})

        //checking password
        const isMatch=await bcrypt.compare(password,useremail.password);

        const token=await useremail.generateAuthToken();
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+50000),
            httpOnly:true
        })

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("Invalid email or password");
        }
        

    }catch(error){
        res.status(400).send("Invalid email or password")
    }
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})