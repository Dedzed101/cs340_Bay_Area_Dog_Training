// SETUP

//Initialize modules
const { engine } = require('express-handlebars');
var express = require("express");
var exphbs = require("express-handlebars").create({ extname: 'hbs', defaultLayout: 'main' });
var path = require("path");
var app = express();

// Database
var db = require('./database/db-connector')
const PORT = 52522;

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Configuring Express to Handle JSON and Form Data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// HANDLEBARS setting -- shorten file extension to .hbs
app.engine('hbs', exphbs.engine);
app.set('view engine', 'hbs');


// GET ROUTES

app.get('/', function (req, res) {
    res.render('Index');
});

app.get('/Customers', function (req, res) {
    let query1 = "SELECT * FROM Customers;";
    db.pool.query(query1, function (error, rows, fields) {
        res.render('Customers', { data: rows });
    });
});

app.get('/Dogs', function (req, res) {
    let query1 = "SELECT * FROM Dogs;";
    let query2 = "SELECT * FROM Customers"
    db.pool.query(query1, function (error, rows, fileds) {
        let dogs = rows;
        db.pool.query(query2, (err, row, field) => {
            let customers = row;
            let customermap = {};
            customers.map(customer => {
                let id = parseInt(customer.id_customer, 10)
                customermap[id] = customer["name"];
            })

            dogs = dogs.map(dog => {
                let vaccinated = "No"
                if (dog["fully_vaccinated"] == 1) {
                    vaccinated = "Yes"
                }
                return Object.assign(dog, { vaccinated: vaccinated }, { customer: customermap[dog.id_customer] })
            })

            return res.render('Dogs', { data: dogs, customers: customers })
        })
    })
});

app.get('/update-form', function (req, res) {

})

app.get('/Dog_has_Training_Session', function (req, res) {
    res.render('Dog_has_Training_Session');
});

app.get('/Packages', function (req, res) {
    res.render('Packages');
});

app.get('/Purchases', function (req, res) {
    res.render('Purchases');
});

app.get('/Session_Types', function (req, res) {
    res.render('Session_Types');
});

app.get('/Trainers', function (req, res) {
    res.render('Trainers');
});

app.get('/Trainer_has_Training_Session', function (req, res) {
    res.render('Trainer_has_Training_Session');
});

app.get('/Training_Sessions', function (req, res) {
    res.render('Training_Sessions');
});

// POST ROUTES

// POST Route for inserting new Customer to Customers table
app.post('/add-customer-form', function (req, res) {
    let data = req.body;

    let number_of_dogs_enrolled = parseInt(data['input-dogs-enrolled']);
    if (isNaN(number_of_dogs_enrolled)) {
        number_of_dogs_enrolled = 'NULL'
    }

    query1 = `INSERT INTO Customers(name, email, phone_number, 
    number_of_dogs_enrolled) VALUES ('${data['input-name']}', 
    '${data['input-email']}', '${data['input-phone-number']}', 
    '${number_of_dogs_enrolled}');`

    db.pool.query(query1, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }

        else {
            res.redirect('/Customers')
        }
    })
});


app.post('/add-dog-form', function (req, res) {
    let data = req.body;

    let age = parseInt(data['input-age']);
    if (isNaN(age)) {
        age = 'NULL'
    }

    console.log('input-customer: ', data.customer)
    const vaccinated = data['input-vaccinated'] == 'Y' ? 1 : 0;

    let inserQuery = `INSERT INTO Dogs(id_customer, fully_vaccinated, temperament, name, age, breed)
    VALUES (
            '${data['customer']}', 
            '${vaccinated}', 
            '${data['input-temperament']}', 
            '${data['input-name']}',
            '${age}', 
            '${data['input-breed']}'
            );`

    db.pool.query(inserQuery, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }

        else {
            res.redirect('/Dogs')
        }
    })
});

// DELETE ROUTES

//DELETE Route for deleting Customer from Customer table
app.delete('/delete-customer', function (req, res, next) {
    let data = req.body;
    let customerID = parseInt(data.id_customer);
    let deleteCustomers = `DELETE FROM Customers WHERE id_customer = ?`;
    // Run the 1st query
    db.pool.query(deleteCustomers, [customerID], function (error, rows, fields) {
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        else {
            res.sendStatus(204);
        }
    })
});


app.delete('/delete-dog', function (req, res, next) {
    let data = req.body;
    let dogID = parseInt(data.id_dog);
    let deleteDog = `DELETE FROM Dogs WHERE id_dog = ?`;
    // Run the 1st query
    db.pool.query(deleteDog, [dogID], function (error, rows, fields) {
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        }

        else {
            res.sendStatus(204);
        }
    })
});

// LISTENER

app.listen(PORT, function () {
    console.log(`Express started on http://${process.env.HOSTNAME}:${PORT}/Index; press Ctrl-C to terminate.`)
});    