const { Client } = require('@elastic/elasticsearch');

const csv = require('csv-parser');

const fs = require('fs');
require('dotenv').config();
// התחברות ל-ElasticSearch

const client = new Client({
  // node: 'http://localhost:9200',
  node: process.env.ELASTICSEARCH_HOST,
  auth:{
    username:'elastic',
    password:'FyiwL_bNosJ2tFc6Cnyy'
  },
  requestTimeout: 60000, // 60 שניות כברירת מחדל לכל הבקשות
  maxRetries: 3, // נסה מחדש עד 3 פעמים במקרה של כשל
  sniffOnConnectionFault: true // בדוק חיבור מחדש במקרה של תקלה
 });
 
client.ping().then(()=>console.log('elastic search')).catch((err)=>console.error('error elastic search',err))

  const indexName = 'streets'; 
async function createIndex(){
  try{
    const exists=await client.indices.exists({index:indexName})
    // if(exists)
    // {
    //   const response = await client.indices.delete({
    //     index: indexName
    //   });
    // }
  //  console.log(response);
    if(!exists)
    {
      const mapping=JSON.parse(fs.readFileSync('mapping.json','utf8'))
      await client.indices.create({index:indexName,body:mapping})
      console.log('create file successfully')
    }
      else{
        console.log('index exists')
      }
    }
    catch(err)
    {
      console.error('err create index',err)
    }
  }
  function transformRow(row) {

    return {
  
      main_name: row["שם ראשי"] || "",
  
      title: row["תואר"] || "",
  
      secondary_name: row["שם מישני"] || "",
  
      category: row["קבוצה"] || "",
  
      additional_category: row["קבוצה נוספת"] || "",
  
      type: row["סוג"] || "",
  
      neighborhood_code: row["קוד שכונה"] ? parseInt(row["קוד שכונה"]) : null,
  
    };
  }
  async function loadCSVtoElastic() {
    const bulkData = [];
    const chunkSize = 100;
  
    fs.createReadStream('streets.csv')
      .pipe(csv())
      .on('data', (row) => {
        const doc = transformRow(row);
        bulkData.push({ index: { _index: indexName } });
        bulkData.push(doc);
  
        if (bulkData.length >= chunkSize * 2) {
          processBulk(bulkData.splice(0, chunkSize * 2));
        }
      })
      .on('end', async () => {
        if (bulkData.length > 0) {
          await processBulk(bulkData);
        }
        console.log('טעינת כל הנתונים הסתיימה');
      })
      .on('error', (err) => console.error('שגיאה בקריאת CSV:', err));
  }
  
  async function processBulk(data) {
    try {
      const { body } = await client.bulk({
        refresh: true,
        body: data,
        timeout: '60s' // הגדלנו ל-60 שניות ליתר ביטחון
      });
      console.log('מנה נטענה בהצלחה:', body.items.length / 2, 'רשומות');
    } catch (error) {
      console.error('שגיאה בטעינת מנה:', error);
    }
  }


               async function loadData(){
               await createIndex();
               await loadCSVtoElastic();
               };
               
module.exports.loadData=loadData;
module.exports.client=client