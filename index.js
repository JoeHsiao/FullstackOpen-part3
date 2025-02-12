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

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(result => {
      console.log('findById', result)
      response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  const person = {
    name: request.body.name,
    number: request.body.number
  }

  Person.findByIdAndUpdate(id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).send()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  if (!request.body.name || !request.body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const newPerson = new Person({
    name: request.body.name,
    number: request.body.number
  })
  newPerson
    .save()
    .then(() => {
      console.log(`added ${request.body.name} number ${request.body.number} to phonebook`)
      response.json(newPerson)
    })
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has info for ${count} people <br> ${new Date().toUTCString()}`)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

// when deployed, PORT is from fly.toml
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log('Server running')
})