const express = require('express')
const app = express()
app.use(express.json())

const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const toDate = require('date-fns/toDate')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/'),
    })
  } catch (error) {
    console.log(error.message)
    
  }
}

initializeDbAndServer()

const checkRequestsQuery = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query
  const {todoId} = request.params

  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LERNING']
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined)
    try {
      const myDate = new Date(date)
      const formatedDate = format(new Date(date), "yyyy-MM-dd");
      console.log(formatedDate, 'f')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()} - ${
            myDate.getMonth() + 1
          } - ${myDate.getDate()}`,
        ),
      )

      console.log(result, 'r')
      console.log(new Date(), 'new')
      const isValidDate = await isValid(result)
      console.log(isValidDate, 'v')
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }

  request.todoId = todoId
  request.search_q = search_q
  next()
}
const checkRequestsBody = (request , response , next) => {
const {id, todo, category, priority, status, dueDate} = request.body;
const { todoId } = request.params;
if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LERNING']
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }
if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

if (dueDate !== undefined)
    try {
      const myDate = new Date(dueDate)
      const formatedDate = formate(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate)
      const result = toDate(new Date(formatedDate))
      const isValidDate = isValid(result)
      console.log(isValidDate)
      console.log(isValidDate)
      
      if (isValidDate === true) {
        request.dueDate = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }

  request.todo= todo
  request.id= id
  request.todoId = todoId;
  next()
}


//get Todos API 1 

app.get("/todos/" , checkRequestsQuery, async (request, response) => {
const { status = "", search_q = "", priority = "", category = "" } = request;
console.log(status, search_q, priority,category);
const getTodosQuery = `
 SELECT id,todo,priority,status,category,due_date AS dueDate
 FROM todo WHERE todo LIKE '%${status}%' AND category LIKE '%${category}%';`;
 const todosArray = await db.all(getTodosQuery)
response.send(todosArray)
});

// get Todo API 2 


app.get('/todos/:todoId/', checkRequestsQuery, async (request, response) => {
    const { todoId } = request;
    const getTodoQuery = `
    SELECT id,todo,priority,status,category,due_date AS dueDate
      
    FROM
      todo
    WHERE
      id = ${todoId};`
    const todo = await db.get(getTodoQuery)
    response.send(todo)
})

// get Todo API 3 

app.get("/agenda/", checkRequestsQuery, async (request, response) => {
const { date } = request;
console.log(date , "a");
const selectDueDateQuery = `
SELECT id,todo,priority,status,category,due_date AS dueDate
FROM todo
WHERE due_date = '${date}';`;

const todosArray = await db.all(selectDueDateQuery)
if (todosArray !== undefined){
  response.status(400)
  response.send("Invalid Due Date")
}else {
  response.send(todosArray)
}
})


//get Todo API 4 


app.post('/todos/', checkRequestsBody,  async (request, response) => {
    const {
        id,
        todo,
        category,
        priority,
        status,
        dueDate
    } = request;
    const addTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status, category, due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}','${dueDate}');`
   const createUser = await db.run(addTodoQuery)
    console.log(createUser)
    response.send('Todo Successfully Added')
})

// get Todo API 5 

app.put('/todos/:todoId/', checkRequestsBody,  async (request, response) => {
    const {
        todoId
    } = request;
    const {todo, category, priority, status, dueDate} = request
    let updateTodoQuery = null;
    console.log(todo, category, priority, status, dueDate)
    switch (true) {
    case status !== undefined:
     updateTodoQuery = `
    UPDATE
      todo
    SET
      status='${status}'
    WHERE
      id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send("Status Updated")
    break 

   case priority !== undefined:
     updateTodoQuery = `
    UPDATE
      todo
    SET
      priority ='${priority}'
    WHERE
      id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send("Priority Updated")
    break 

  case todo !== undefined:
     updateTodoQuery = `
    UPDATE
      todo
    SET
      todo ='${todo}'
    WHERE
      id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send("Todo Updated")
    break 

   case category !== undefined:
     updateTodoQuery = `
    UPDATE
      todo
    SET
      category ='${category}'
    WHERE
      id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send("Category Updated")
    break 

   case dueDate !== undefined:
     updateTodoQuery = `
    UPDATE
      todo
    SET
      due_date ='${dueDate}'
    WHERE
      id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send("Due Date Updated")
    break 
}
})
    
// get todo API 6

app.delete('/todos/:todoId/', async (request, response) => {
    const {
        todoId
    } = request.params
    const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`

    await db.run(deleteTodoQuery)
    response.send('Todo Deleted')
})

module.exports = app



