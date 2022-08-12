const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req, res)
    ].join(' ')
}))

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body
    const nameExists = persons.find(person => person.name === name)

    if (!name || !number || nameExists) {
        return res.status(400)
            .json({
                error: nameExists 
                    ? 'name must be unique'
                    : !name
                        ? 'you must enter name'
                        : 'you must enter phone number'
            })
    }

    const newPerson = {
        id: Math.random().toString(),
        name,
        number
    }

    persons = persons.concat(newPerson)
    res.status(201).json(newPerson)
})

app.get('/api/persons/:id', (req, res) => {
    const selectedId = Number(req.params.id)
    const person = persons.find(p => p.id === selectedId)
    if (person) {
        return res.json(person)
    }
    res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    const selectedId = Number(req.params.id)
    persons = persons.filter(p => p.id !== selectedId)

    res.status(204).end()
})

app.get('/info', (req, res) => {
    res.send(`<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    </div>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`))