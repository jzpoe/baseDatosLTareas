const express = require('express');
const app = express();
const userRoutes = require('./src/routes/userRoutes');

const PORT = process.env.PORT || 3001;



app.use(express.json());
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});