const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

var users = []
var exercises = []


app.post('/api/users', (req, res) => {
    username = req.body.username
    if (username != "") {
        _id = String(users.length + 1)
        user = { username: username, _id: _id }
        users.push(user)
        res.json(user)
    }
});

app.post('/api/users/:_id/exercises', (req, res) => {
    const _id = req.params["_id"]

    // find the username by _id
    users.forEach(user => {
        if (user["_id"] == _id) { username = user["username"] }
    });

    const description = req.body.description
    const duration = Number(req.body.duration)

    // set the date to today if it is empty or invalid
    if (req.body.date == "") {
        date = new Date(Date.now())
    } else {
        date = new Date(req.body.date)
        if (date == "Invalid Date") { date = new Date(Date.now()) }
    }

    // add the exercise to the exercises array
    exercises.push({
        username: username,
        description: description,
        duration: duration,
        date: date,
        _id: _id
    })

    // send the exercise with a formated date field
    res.json({
        username: username,
        description: description,
        duration: duration,
        date: date.toDateString(),
        _id: _id
    })

});


app.get('/api/users', (req, res) => {
    res.send(users)
});

app.get('/api/users/:_id/logs', (req, res) => {

    const _id = req.params["_id"]

    // get username by id
    users.forEach(user => {
        if (user["_id"] == _id) { username = user["username"] }
    });

    // create user_exercises array
    user_exercises = []

    if (req.query["from"] && req.query["to"]) {

        // get the dates and the and convert it to milliseconds
        // added one day to to_date
        const from_date = new Date(req.query["from"]).valueOf()
        const to_date = new Date(req.query["to"]).valueOf() + 86400000

        // create user log with filtering by the optional parameter
        exercises.forEach(item => {
            if (item["date"].valueOf() >= from_date && item["date"].valueOf() < to_date && item["_id"] == _id) {
                user_exercises.push({
                    description: item["description"],
                    duration: item["duration"],
                    date: item["date"].toDateString()
                });
            }
        });

    } else {

        // create user log without filtering
        exercises.forEach(item => {
            if (item["_id"] == _id) {
                user_exercises.push({
                    description: item["description"],
                    duration: item["duration"],
                    date: item["date"].toDateString()
                });
            }
        });
    }

    // limit the logs if a limit is send in query
    if (req.query["limit"]) {
        const limit = req.query["limit"]
        user_exercises = user_exercises.slice(0, limit)
    }

    // create the final user log and send it
    res.json({
        username: username,
        count: user_exercises.length,
        _id: _id,
        log: user_exercises
    })
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
