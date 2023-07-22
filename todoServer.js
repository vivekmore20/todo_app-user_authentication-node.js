const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/todoViews/index.html");
});

app.get("/styles.css", function (req, res) {
  res.sendFile(__dirname + "/todoViews/styles.css");
});

app.post("/todo", function (req, res) {
  saveTodoInFile(req.body, function (err) {
    if (err) {
      res.status(500).send("error");
      return;
    }

    res.status(200).send("success");
  });
});

app.get("/todo-data", function (req, res) {
  readAllTodos(function (err, data) {
    if (err) {
      res.status(500).send("error");
      return;
    }
    res.status(200).json(data);
  });
});
app.get("/todoScript.js", function (req, res) {
  res.sendFile(__dirname + "/todoViews/todoScript.js");
});

app.post("/delete",function(req,res){
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
    const id=req.body.userid;
    updateTodoInFile(id, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).send("success");
    })
})

app.post("/updatein", function (req, res) {
    const id=req.body.userid;
    console.log(id);
    updateTodoIn(id, function (err) 
    {
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
        fs.writeFile("./todo.json", JSON.stringify(updatedData), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    })
}

function updateTodoIn(userId, callback) {
    readAllTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        const updatedData = data.map((todo) => {
            if (todo.userid == userId) {
                todo.completed = false;
            }
            return todo;
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