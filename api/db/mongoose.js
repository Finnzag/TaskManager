// handles connection to the mongo DB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("connected to MongoDB successfull!!!!");
}).catch((e) => {
    console.log("Error connecting to MongoDB");
    console.log(e);
});

// prevent deprecation warning from mongoDB
//mongoose.set('useCreateIndex', true);
//mongoose.set('useFindAndModify', true);

module.exports = {
    mongoose
}