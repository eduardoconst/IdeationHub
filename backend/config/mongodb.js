const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/knowledge_votes', {useNewUrlParser: true})
    .catch(err => {})