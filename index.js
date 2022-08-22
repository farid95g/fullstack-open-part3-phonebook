require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/phonebook')

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body)
})

const errorHandler = (err, req, res, next) => {
    console.log(err.message)

    if (err.name === 'CastError') {
        return res.status(400).send({ error: 'Malformatted id.' })
    }

    next(err)
}

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('build'))
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
    Person.find({})
        .then(persons => res.json(persons))
        .catch(err => res.status(404).json({ err }))
})

app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body
    Person.findOne({ name })
        .then(person => {
            const newPerson = new Person({ name, number })

            if (!person) {
                newPerson.save()
                    .then(newPerson => res.status(201).json(newPerson))
                    .catch(err => res.status(404).json({ err: err.message }))
            } else {
                person.overwrite(newPerson)
                    .save()
                    .then(result => res.json(result))
            }
        })
        .catch(err => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (!person)
                return res.status(404).json({ error: 'Person not found.' })
            
            res.json(person)
        })
        .catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).end()
        })
        .catch(err => next(err))
})

app.get('/info', (req, res, next) => {
    Person
        .find()
        .then(persons => {
            res.send(`<div>
                <p>Phonebook has info for ${persons.length} people</p>
                <p>${new Date()}</p>
            </div>`)
        })
        .catch(err => next(err))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`))