const express = require("express");
const fs = require("fs");
var session = require('express-session');
const app = express();

app.set("view engine", "ejs");
app.use(session({
  secret: 'node.js',
  resave: false,
  saveUninitialized: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.render("index", { username: req.session.username });
});

app.get("/about", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }

  res.render("about", { username: req.session.username });
});

app.get("/contact", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }

  res.render("contact", { username: req.session.username });
});

app.get("/home", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  data =readFileData();
  console.log(data);
  if(data){
    res.render("home", { username: req.session.username, data : data });
  }
  else{
    res.render("home", { username: req.session.username, data : [] });
  }
}
)

function readFileData() {
  const data = fs.readFileSync("./data.json");
  return JSON.parse(data);
}
app.get("/styles.css", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/styles.css");
});

app.get("/login", function (req, res) {
  
  res.render("login",{error:null});
});

app.get("/signup",function(req,res){

  res.render("signup");

})
app.get("/logout", (req, res) => {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  req.session.destroy();
  res.redirect("/login");
});
  
app.post("/signup",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  const email=req.body.email;
  const phone=req.body.phone;
  const address=req.body.address;
  const data={
      username:username,
      password:password,
      email:email,
      phone:phone,
      address:address
  }
  saveUserinFile(data,function(err){
      if(err){
          if(err==="user already exists"){
              res.status(409).send("user already exists");
              return;
          }
          res.status(500).send("error");
          return;
      }
      res.redirect("/login");
  } 
  )
})

app.post("/login", function (req, res) {
  req.session.username = req.body.username;
  req.session.isLoggedIn = true;
  const username = req.body.username;
  const password = req.body.password;
  readAllUser(function(err,data){
    if(err){
      
      res.status(500).send("error");
      return;
    }
    const user=data.find((user)=>{
      return user.username===username && user.password===password;
    })
    if(user){
      res.redirect("/home");
    }else{
      res.render("login",{error:"Invalid username or password"});
    }
  } 
  )
});


app.post("/todo", function (req, res) {
  if(!req.session.isLoggedIn){
    res.status(401).send("unauthorized");
    return;
  }
  
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    res.status(200).send("success");
  });
});

app.get("/todo-data", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});
app.get("/todoScript.js", function (req, res) {
  if(!req.session.isLoggedIn){
    res.redirect("/login");
    return;
  }
  res.sendFile(__dirname + "/todoViews/todoScript.js");
});

app.post("/delete",function(req,res){
    if(!req.session.isLoggedIn){
      res.status(401).send("unauthorized");
      return;
    }
    const userid=req.body.userid;
    console.log(userid);
    deleteItemTodo(userid,function(err){
        if(err){
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })

})

app.post("/update", function (req, res) {
  if(!req.session.isLoggedIn){
    res.status(401).send("unauthorized");
    return;
  }
    const id=req.body.userid;
    updateTodoInFile(id, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })
})
    

function updateTodoInFile(userId,callback) {
    readAllTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        const updatedData = data.map((todo) => {
            if (todo.userid == userId) {
              if(todo.completed!==true){
                todo.completed = true;
              }else{
                todo.completed = false;
              }
            }
            return todo;
        })
     
        fs.writeFile("./todo.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    })
}



function readAllTodos(callback) {
  fs.readFile("./todo.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    if (data.length === 0) {
      data = "[]";
    }
    try {
      data = JSON.parse(data);
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    data.push(todo);

    fs.writeFile("./todo.json", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  });
}

function deleteItemTodo(userid,callback){
    console.log("userid"+userid);
    readAllTodos(function(err,data){
        if(err){
            callback(err);
            return;
        }
        const updatedData=data.filter((todoItem)=>{
            return todoItem.userid!==userid;
        })
        fs.writeFile("./todo.json", JSON.stringify(updatedData), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    })
}
app.listen(3000, function () {
  console.log("server on port 3000");
});

function readAllUser(callback){
    fs.readFile("./users.json","utf-8",function(err,data){
        if(err){
            callback(err);
            return;
        }
        if(data.length===0){
            data="[]";
        }
        try{
            data=JSON.parse(data);
            callback(null,data);
        }catch(err){
            callback(err);
        }
    })
}

function saveUserinFile(user,callback){
    let userexists=false;
    readAllUser(function(err,data){
        if(err){
            callback(err);
            return;
        }
        data.forEach((user1)=>{
         if(user1.username===user.username){
            userexists=true;
            return;
         }
      })
      if(!userexists){
        data.push(user);
        fs.writeFile("./users.json",JSON.stringify(data),function(err){
            if(err){
                callback(err);
                return;
            }
            callback(null);
        })
      }else{
        console.log("user already exists");
        callback("user already exists");
      }
    })
}
