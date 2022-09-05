const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the all the arguments: node mongo.js <password> <name> <phoneNumber>')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://faridg1995:${password}@cluster0.nw3lfgb.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

mongoose
    .connect(url)
    .then(() => {
        if (!name && !number) {
            console.log('phonebook:')
            return Person.find({}).then((people) => {
                if (people.length) {
                    people.forEach(person => {
                        console.log(`${person.name} ${person.number}`)
                    })
                } else {
                    console.log('No entries yet.')
                }
            })
        }

        const newPerson = new Person({
            id: Math.random(),
            name,
            number
        })

        return newPerson.save().then(() => {
            console.log(`Added ${name} number ${number} to phonebook.`)
        })
    })
    .catch((error) => {
        console.log(error)
    })
    .finally(() => mongoose.connection.close())