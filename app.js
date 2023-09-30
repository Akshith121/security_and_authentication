import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import md5 from "md5";


const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/SecretsAppDb")
.then(console.log("Database connection established"));

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true,"username is required, cannot be null"],
        unique: true
    },
    password: {
        type: String,
        required: [true,"password is required, cannot be null"]
    }
});


const User = mongoose.model("User", userSchema);

const secretSchema = new mongoose.Schema({
    secret: {
        type: String,
        required: [true,"Secret is required, cannot be null"]
    }
});

const secret = new mongoose.model("secret", secretSchema);

app.get("/", (req,res) => {
    res.render("home.ejs");
});

app.get("/register", (req,res) => {
   res.render("register.ejs");
});

app.get("/login", (req,res) => {
    res.render("login.ejs");
});

app.post("/register", (req,res) => {
   const username = req.body.username;
   const password = md5(req.body.password);
   const newUser = new User({
     username: username,
     password: password
   });
   newUser.save();
   console.log("Successfully registered!");
   res.render("secrets.ejs");
});

app.post("/login", async (req,res) => {
   const username = req.body.username;
   const password = md5(req.body.password);
   try{
      const user = await User.findOne({username: username});
      if(user != null){
        if(user.password == password){
           res.render("secrets.ejs");
        }
        else{
           console.log("Check your password and try again!");
        // res.json({msg: "Check your password and try again!"});
           res.redirect("/login");
        }
      }
      else{
        console.log("Either username or password were wrong, please try again!");
        res.redirect("/login");
      }
   }catch(err){
      console.log(err);
      res.status(500);
   }
});

app.get("/logout", (req,res) => {
   res.redirect("/");
});

app.get("/submit", (req,res) => {
    res.render("submit.ejs");
});

app.post("/submit", (req,res) => {
   const sec = req.body.secret;
   const sec1 = new secret({
     secret: sec
   });
   sec1.save();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
