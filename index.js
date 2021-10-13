const express = require('express');
const redis = require('redis');
const fetch = require('cross-fetch');

// environment variables
const app = express();
const client = redis.createClient(6379);

function forwardData(country, website) {
    return `${country} =>> ${website}`;
}

//middleware to check if the country exist in redis database
function checkForCache(req, res, next) {
    const { country } = req.params;
    client.get(country, (err, website) => {
        if (err) throw err;
        if (website != null) res.send(forwardData(country, website));
        else next();
    })
}

// Dynamics url Path
app.get('/:country', checkForCache, async (req, res) => {
    try {
        const { country } = req.params;
        const resp = await fetch(`http://universities.hipolabs.com/search?country=${country}`);
        const data = await resp.json();
        const website = data[0].web_pages[0];
        client.setex(country, 3600, website[0]);
        res.send(forwardData(country, website));
    } catch (err) {
        console.log("Error:", err);
    }

})



app.listen(7000, () => {
    console.log("Server is runnign on port: ", 7000);
});

//app.get('/',(req,res )=> {
    //     res.send("heloooo");
    // })