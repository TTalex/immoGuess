
const express = require('express')
const request = require("request");
const fs = require('fs');

const app = express()
const port = 3000

const getNewData = (type, cb) => {
    const options = { 
        method: 'GET',
        url: 'https://www.bienici.com/realEstateAds.json',
        qs: { 
            filters: `{"size":100,"from":0,"showAllModels":false,"filterType":"${type}","propertyType":["house","flat"],"page":1,"sortBy":"publicationDate","sortOrder":"desc","onTheMarket":[true]}`,
            extensionType: 'extendedIfNoResult',
            leadingCount: '2'
        },
        headers: {'cache-control': 'no-cache' } }
    
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        fs.writeFileSync('data.json', body)
        cb()
    });
}

const loadData = (cb) => {
    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.log("data has yet to be loaded")
            return cb();
        }
        let loaded = JSON.parse(data);
        cb(loaded)
    });
}

app.use(express.static('frontend'));

app.get('/api', (req, res) => {
    loadData(data => res.json(data));
})
// type is "rent" or "buy"
app.get('/getNewData/:type', (req, res) => {
  getNewData(req.params.type, () => res.json({}));
  
})
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})



