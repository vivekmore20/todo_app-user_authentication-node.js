const submitTodoNode = document.getElementById("submitTodo");
const userInputNode = document.getElementById("userInput");
const prioritySelectorNode = document.getElementById("prioritySelector");
const todoListNode = document.getElementById("todo-item");
submitTodoNode.addEventListener("click", function () {
  const todoText = userInputNode.value;
  const priority = prioritySelectorNode.value;
  if (!todoText || !priority) {
    alert("Please enter a todo");
    return;
  }
  const todo = {
    userid: new Date().getTime().toString(),
    todoText,
    priority,
    completed:false,
  };

  fetch("/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  }).then(function (response) {
    if (response.status === 200) {
      showTodoInUI(todo);
    } else {
      alert("something weird happened");
    }
  });
});

function showTodoInUI(todo) {
  const todoTextNode = document.createElement("li");
  const node = document.createElement("div");
  todoTextNode.innerText = todo.todoText;
  todoListNode.appendChild(node);
  node.appendChild(todoTextNode);
  var x = document.createElement("INPUT");
  x.setAttribute("type", "checkbox");
  x.className = "checkbox";
  node.appendChild(x);
  let text = document.createElement("p");
  text.innerText = todo.priority;
  text.className = "priority";
  node.appendChild(text);
  const deleteItem = document.createElement("button");
  deleteItem.setAttribute('id', 'delete-btn');
  deleteItem.innerText = "Delete";
  node.appendChild(deleteItem);
  deleteItem.addEventListener('click', function () {
    deleteItemTodo(todo);
  })
  x.addEventListener("change", () => {
    if (x.checked) {
      // text.innerHTML = "complete";
      updateStatus(todo.userid, todo);
      todoTextNode.style.textDecorationLine="line-through";
    } else {
      // text.innerHTML = "incomplete";
      console.log("im incomplete");
      updateStatus(todo.userid, todo);
      todoTextNode.style.textDecorationLine="none";
    }
  });

}

function deleteItemTodo(todo){
    console.log(todo);
    fetch("/delete",{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify(todo)
    }).then(function(response){
        if(response.status===200){
            console.log("saved");
            newTodo();
        }else(err)=>{
            alert("Error while deleting todo");
        }
    }).catch(function(err){
        alert("Error while deleting todo");
    }
    )

}

function updateStatus(id, todo) {
  console.log(JSON.stringify(todo));
  fetch(`/update`, {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  }).then(function (response) {
    console.log("then")
    if (response.status == 200) {
      console.log("saved");
      
    } else (err) => {
      alert("Error while updating todo");
    }
  }).catch(function (err) {
    alert("Error while updating todo");

  }
  )
}
function newTodo() {
  fetch("/todo-data")
    .then(function (response) {
      if (response.status === 200) {
        return response.json();
      } else {
        alert("something weird happened");
      }
    })
    .then(function (todos) { 
     todoListNode.innerHTML = ""; 
      todos.forEach(function (todo) {
      showTodoInUI(todo);
      });
    }).catch(function (err) { 
      alert("Error while updating todo");
    })
}

fetch("/todo-data")
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else {
      alert("something weird happened");
    }
  })
  .then(function (todos) {
    todos.forEach(function (todo) {
      showTodoInUI(todo);
    });
  });


