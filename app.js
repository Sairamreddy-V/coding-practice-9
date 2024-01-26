const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const filepath = path.join(__dirname, 'userData.db')

let db

const iniatizeBdAndServerObject = async () => {
  try {
    db = await open({
      filename: filepath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`server running.....`)
    })
  } catch (error) {
    console.log(`dberror:${error.message}`)
    process.exit(1)
  }
}

iniatizeBdAndServerObject()

//registration api
app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hassedPassword = await bcrypt.hash(password, 10)
  const userQuery = `
    SELECT 
      * 
    FROM 
      user
    WHERE 
      username = '${username}'`
  const dbUser = await db.get(userQuery)
  console.log(dbUser)
  console.log(password.length)

  if (dbUser === undefined) {
    if (password.length >= 5) {
      const addUser = `
            INSERT INTO user(username,name,password,gender,location)
            VALUES(
                '${username}',
                '${name}',
                '${hassedPassword}',
                '${gender}',
                '${location}'
                )`
      await db.run(addUser)
      response.send(`Successful registration of the registrant`)
    } else {
      response.send(`Password is too short`)
    }
  } else {
    response.send(`User already exists`)
  }
})

//login user
app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const hassedPassword = await bcrypt.hash(password, 10)
  const userQuery = `
    SELECT 
      * 
    FROM 
      user
    WHERE 
      username = '${username}'`
  const dbUser = await db.get(userQuery)

  if (dbUser === undefined) {
    response.status(400)
    response.send(`Invalid user`)
  } else {
    const ispasswordMatch = await bcrypt.compare(password, dbUser.password)
    if (ispasswordMatch) {
      response.send(`Login success!`)
    } else {
      response.send(`Invalid password`)
    }
  }
})

// changing th password
app.put('/change-password', async (requset, response) => {
  const {username, oldPassword, newPassword} = requset.body
  console.log(username)
  const userQuery = `
  SELECT 
    *
  FROM 
    user
  WHERE 
    username = '${username}'`
  const dbUser = await db.get(userQuery)
  const isPasswordMatch = await bcrypt.compare(oldPassword, dbUser.password)
  if (isPasswordMatch) {
    if (newPassword.length >= 5) {
      const updateUser = `
      UPDATE 
        user
      SET(
        password='${newPassword}';
      )`
      const user = await db.run(updateUser)
      response.send('Password updated')
    } else {
      response.send(`Password is too short`)
    }
  } else {
    response.send('Invalid current password')
  }
})
module.exports=add
