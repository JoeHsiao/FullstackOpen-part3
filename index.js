const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

morgan.token('req-body', function getBody(req) {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
    return ''
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(result => {
            response.json(result)
        })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)
    if (person) {
        response.json(person)
    } else {
        response.statusMessage = `Cannot find persion with id ${id}`
        response.status(404).send()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).send()
        })
})

app.post('/api/persons', (request, response) => {
    if (!request.body.name || !request.body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    // if (persons.find(p => p.name === person.name)) {
    //     return response.status(400).json({
    //         error: 'name already exists'
    //     })
    // }
    const newPerson = new Person({
        name: request.body.name,
        number: request.body.number
    })
    newPerson
        .save()
        .then(result => {
            console.log(`added ${request.body.name} number ${request.body.number} to phonebook`)
            response.json(newPerson)
        })
})

app.get('/info', (request, response) => {
    response.send(`Phonebook has info for ${persons.length} people <br> ${new Date().toUTCString()}`)
})

// when deployed, PORT is from fly.toml
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('Server running')
})