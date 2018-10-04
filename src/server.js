const express = require('express');
const rallyLookup = require('./rally-lookup');
const app = express();
const port = process.env.SERVER_PORT || 8080;

app.use(express.json());
app.use(express.urlencoded());

app.post('/', (req, res) => {
    return rallyLookup(req, res);
});

app.listen(port, () => console.log(`App listening on port ${port}`));
