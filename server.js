const express = require('express');

const cors = require('cors'); // הוספת cors
const multer = require('multer');
const loadData = require('./loadData.cjs');

const axios = require('axios');
require('dotenv').config();



const app = express();
// הגדרת CORS לאפשר בקשות מ-React
app.use(cors({
  origin: 'http://localhost:3000' // המקור שממנו מגיעות הבקשות (React)
}));
const port = 5000;




// Middleware לקריאת JSON

app.use(express.json());



// הגדרת `multer` להעלאת קובצי CSV

const upload = multer({ dest: 'uploads/' });



// ** נקודה לעצור כאן ולבדוק ** //

// נסי להריץ את הקובץ עם:

console.log('Server is ready!');
app.use(express.json()); // כדי לפרש גוף בקשות JSON

async function searchInElasticsearch(searchQuery, url) {
  try {
    const response = await axios.post(`http://localhost:9200/streets/_search`,
                  searchQuery.searchQuery, {
      auth: {
                      username: 'elastic', // שנה לפי שם המשתמש שלך
                       password:'FyiwL_bNosJ2tFc6Cnyy'
                  },
                  headers: {
                      'Content-Type': 'application/json'
                    }})
    // const response = await axios.post(
    //   `${url}/streets/_search`, // URL דינמי
    //   searchQuery.query,
    //   {
    //     auth: {
    //       username: 'elastic',
    //       password: 'FyiwL_bNosJ2tFc6Cnyy' // שנה לפי סביבת הטסט
    //     },
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     timeout: 60000
    //   }
    // );
    return response;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

// API לחיפוש חופשי
app.post('/api/search', async (req, res) => {
  const searchQuery = req.body; // env: 'local' או 'test'
 // const url = env === 'test' ? 'http://test-server:9200' : 'http://localhost:9200'; // שנה לפי ה-URL של סביבת הטסט
  const url=process.env.ELASTICSEARCH_HOST;
 let reaponse= await loadData.loadData();
 console.log(reaponse)
  // const searchQuery = {
  //   query: {
  //     match: {
  //       main_name: {
  //         query: query,
  //         operator: 'and'
  //       }
  //     }
  //   }
  // };

  try {
    const results = await searchInElasticsearch(searchQuery, url);
    res.send(results.data);
  } catch (error) {
    res.status(500).json({ error: error.message || error });
  }
});
// התחילי את השרת

app.listen(port, () => {

  console.log(`Server running at http://localhost:${port}`);

});