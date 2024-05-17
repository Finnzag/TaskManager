// handles connection to the mongo DB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://270254371:UuscK2j77EZuZ7WP@taskmanager.dlgzrmk.mongodb.net/TestTaskManagerDB?retryWrites=true&w=majority&appName=TestTaskManager', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
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

