import { useState } from 'react';

import axios from 'axios';



function SearchPage() {

    const [q, setQuery] = useState('');

    const [searchType, setSearchType] = useState('free');

    const [results, setResults] = useState([]);

    // const handleSearch = async () => {
    //     try {
    //       const response = await axios.post('http://localhost:3000/api/search', {
    //         query
    //         //, env // 'local' או 'test'
    //       });
    //       setResults(response.data);
    //       setError(null);
    //     } catch (error) {
    //       setError(error.response ? error.response.data.error : 'שגיאה בחיפוש');
    //       setResults([]);
    //     }
    //   };

    const search = async () => {
        let searchQuery;
        switch (searchType) {
            case 'free':
                searchQuery = {
                    query: {
                     
                            match:{
                                main_name:{
                                query: q,
                            operator: 'and'
                      }
                    }
                    }
                };
                break;
            case 'exact':
                searchQuery = {
                    query: {
                        multi_match: {
                       
                            query: q,
                                type: "phrase_prefix", // התאמה מדויקת למילים
                                operator: 'or' // כל המילים חייבות להתאים
                         
                        }
                    }
                 };
                break;
            case 'phrase':
                searchQuery = {
                    query: {
                        multi_match: {
                            query: q, // הטקסט לחיפוש, כמו "יהודית"
                            fields: ["*"], // חיפוש בכל השדות
                            type: "phrase" // דורש התאמה של הביטוי השלם
                          }
                    }
                };
                break;
            default:
                searchQuery = { query: { match_all: {} } };
        }
//        const response = await axios.post(`http://localhost:9200/streets/_search`,
//             searchQuery, {
// auth: {
//                 username: 'elastic', // שנה לפי שם המשתמש שלך
//                  password:'FyiwL_bNosJ2tFc6Cnyy'
//             },
//             headers: {
//                 'Content-Type': 'application/json'
//               }
//             // params: { q, type: searchType },
          
            

//         });
let response
try {
    response = await axios.post('http://localhost:5000/api/search', {
        searchQuery
      //, env // 'local' או 'test'
    });
    setResults(response.data);
    // setError(null);
  } catch (error) {
    // setError(error.response ? error.response.data.error : 'שגיאה בחיפוש');
    setResults([]);
  }
        setResults(response.data.hits.hits);

    };



    return (

        <div>

            <input type="text" value={q} onChange={(e) => setQuery(e.target.value)} />

            <div>

                <label>

                    <input type="radio" value="free" checked={searchType === 'free'} onChange={() => setSearchType('free')} />

                    חיפוש חופשי

                </label><br></br>

                <label>

                    <input type="radio" value="exact" checked={searchType === 'exact'} onChange={() => setSearchType('exact')} />

                    חיפוש מדויק

                </label><br></br>

                <label>

                    <input type="radio" value="phrase" checked={searchType === 'phrase'} onChange={() => setSearchType('phrase')} />

                    חיפוש ביטוי שלם

                </label><br></br>

            </div>

            <button onClick={search}>חפש</button>

            <ul>

                {results.map((r, i) => <li key={i}>{r._source.main_name} - {r._source.secondary_name}- {r._source.title}- {r._source.category}- {r._source.additional_category}</li>)}

            </ul>

        </div>

    );

}

export default SearchPage; // הוסף שורה זו בסוף