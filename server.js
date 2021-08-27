if(process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}


const express = require("express");
const bcrypt = require("bcrypt");
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose')
const app = express();




const initializePassport = require('./passport-config')


 initializePassport (
    passport , 
    email => UserInfo.find(Users => Users.user_email === email),
    id => UserInfo.find(Users => Users.user_id === id)
    )
    let UserInfo = []
    const UserInfos = require('./UserRegister')


app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))



mongoose.set('bufferCommands', false);
const mongoURI =
  "mongodb+srv://niland:nanoNANO1109@todolist.lcqu6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const conn =
  mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
},(err,database)=>{
  db = database
})

let currentUser = ''
let currUserid = ''
let Usersubscribed = []

app.get("/", checkAuthenticated,(req, res) => {
  getAllData()
  currentUser = req.user.user_id
  currUserid = req.user._id
  Usersubscribed = req.user.user_subscribed
  console.log("User Subs",Usersubscribed)
  for(let creaters of UserInfo){
      if(Usersubscribed.includes(creaters._id)){
        console.log(creaters.user_name , "is subed")
      }else{
        console.log(creaters.user_name , "is not subed")
      }
  }
 
  res.render("index.ejs", {user: req.user.user_name , usernames: UserInfo , userSubscribed: Usersubscribed});
});

app.get("/login",checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post("/login",checkNotAuthenticated, passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}));

app.get("/register",checkNotAuthenticated,(req, res) => {
  res.render("register.ejs");
});

app.post("/register",checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const UserInfor = new UserInfos({
      user_id: Date.now().toString(),
      user_name: req.body.name,
      user_email: req.body.email,
      user_password: hashedPassword,

    })
      await UserInfor.save()
      res.redirect("/login");      
  } catch {
    res.redirect("/register");
  }
  console.log(UserInfo);
});

app.delete('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/login')
})

app.post('/subscribe/:id',checkAuthenticated,(req,res)=>{ 
  console.log(req.params.id)
  UserInfos.findOne({_id:currUserid}).exec(async function(err,file){
    if (err){
      console.log(err)
    }
    await file.user_subscribed.push(req.params.id) 
    await file.save()
  })
  UserInfos.findById({_id:req.params.id}).exec(async function(err,file){
    if (err){
      console.log(err)
    }
    await file.user_subscribers.push(currUserid)
    await file.save()
  })
    return res.redirect('/')
})

app.post('/unsubscribe/:id',checkAuthenticated, (req,res)=>{
   UserInfos.updateOne({_id:currUserid},{$pull:{user_subscribed:req.params.id}}).then(()=>{
    console.log("UnSubscribed from ",req.params.id)
    
  }).catch((err)=>{
    console.log(err)
  })
   UserInfos.updateOne({_id:req.params.id},{$pull:{user_subscribers:currUserid}}).then(()=>{
    console.log(currUserid, "unSubscribed from ",req.params.id)
  }).catch((err)=>{
    console.log(err)
  })
  return res.redirect('/')
})


app.get('/subsPage',checkAuthenticated,async(req,res)=>{
  let subsId = [];
  let subNames = [];
  
 await UserInfos.findById({_id:currUserid},(err,data)=>{
    if(err){
      console.log(err)
      return res.redirect('/')
    }    
      console.log("data",data.user_subscribed)
      subsId = data.user_subscribed
      
  })

      for(let subs of subsId){
        await UserInfos.findById({_id:subs},(err,data)=>{
          if(err){
            console.log(err)
          }    
           subNames.push(data.user_name) 
        })
      }
      console.log("subIds ",subsId)
      res.render('subPage.ejs',{subsList:subNames})
})

function checkAuthenticated(req ,res ,next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect('/login')
    }
}

function checkNotAuthenticated(req ,res ,next){
    if(req.isAuthenticated()){
       return res.redirect('/')
    }else{
        next()
    }
}


const getAllData = async()=>{
  await UserInfos.find((err,data) =>{
     if (err) throw err;
     UserInfo = data;  
   })
 }

const port = 3000;
app.listen(port, async () => {
await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
getAllData()
console.log(`Example app listening on port ${port}!`)
});
