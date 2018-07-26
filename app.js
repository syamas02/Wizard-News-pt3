const express = require('express');
const morgan = require('morgan');
// const client = require('./db');
// const postList = require('./views/postList');
// const postDetails = require('./views/postDetails');
const routes = require('./routes/posts');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use('/posts', routes);

app.get('/', (req, res) => {
  res.redirect('/posts');
});

const PORT = 1337;
app.listen(PORT, () => {
  console.log(`App listening in port ${PORT}`);
});
