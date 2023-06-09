// Express server on port 3000

const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
    }
);

app.get('/index.html', (req, res) => {

    res.sendFile(__dirname + '/public/index.html');
    }
);


app.get('/about.html', (req, res) => {    
        res.sendFile(__dirname + '/public/about.html');
        }
    );


app.listen(port, () => console.log(`Example app listening on port ${port}!`));

