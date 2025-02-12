const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.jnztx.mongodb.net/personApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person
    .find({})
    .then(result => {
      result.forEach(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })
}

if (process.argv.length === 5) {
  const nameValue = process.argv[3]
  const numberValue = process.argv[4]

  const person = new Person({
    name: nameValue,
    number: numberValue,
  })

  person
    .save()
    .then(() => {
      console.log(`added ${nameValue} number ${numberValue} to phonebook`)
      mongoose.connection.close()
    })
}

