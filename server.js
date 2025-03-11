const express = require('express');


const multer = require('multer');



require('dotenv').config();



const app = express();

const port = 3000;




// Middleware לקריאת JSON

app.use(express.json());



// הגדרת `multer` להעלאת קובצי CSV

const upload = multer({ dest: 'uploads/' });



// ** נקודה לעצור כאן ולבדוק ** //

// נסי להריץ את הקובץ עם:

console.log('Server is ready!');

// התחילי את השרת

app.listen(port, () => {

  console.log(`Server running at http://localhost:${port}`);

});