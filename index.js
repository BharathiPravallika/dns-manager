const express = require('express')
const morgan = require('morgan');
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes');
const dotenv = require('dotenv');
const FormDataModel = require('./models/FormData');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = '4e9fffe65ed8201df036483cc28b474e51a8090bb4ac9e9929f0bbe7e09189a9';

dotenv.config();

//Express app setup
const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'));

//Use routes
app.use("/api", routes);

const fs = require('fs');

//Register and Login
app.post('/register', (req, res)=>{
    // To post / insert data into database

    const {email, password} = req.body;
    FormDataModel.findOne({email: email})
    .then(user => {
        if(user){
            res.json("Already registered")
        }
        else{
            FormDataModel.create(req.body)
            .then(log_reg_form => res.json(log_reg_form))
            .catch(err => res.json(err))
        }
    })

})


app.post('/login', (req, res) => {
    // To find record from the database
    const { email, password } = req.body;
    FormDataModel.findOne({ email: email })
        .then(user => {
            if (user) {
                // If user found then these 2 cases
                if (user.password === password) {
                    res.json("Success");
                }
                else {
                    res.json("Wrong password");
                }
            }
            // If user not found then 
            else {
                res.json("No records found! ");
            }
        })
})

//serve uploaded files
app.use('/uploads', express.static('uploads'));


//route for serving files from the 'uploads' folder
app.get('/files', (req, res) => {
    const files = fs.readdirSync('./uploads');
    const fileData = [];

    files.forEach(file => {
        const filePath = path.join('./uploads', file);
        const data = fs.readFileSync(filePath, 'utf-8');
        const formattedData = `${file}:\n${data}\n`;
        fileData.push(formattedData);
    });

    res.send(fileData.join('\n'));
});


//Read and log information about the files in the "uploads" folder
const uploadFolderPath = './uploads/';
fs.readdir(uploadFolderPath, (err, files) => {
    if (err) {
        console.error('Error reading upload folder:', err);
        return;
    }
    //Log information about each file in the folder
    console.log('Files in uploads folder:');
    files.forEach(file => {
        console.log(file);
    });
});

const PORT = process.env.PORT || 8080;

//Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/dns-manager")
    .then(() => {
        console.log("connected to DB")
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    })
    .catch((err) => console.log(err));
