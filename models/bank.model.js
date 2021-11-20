const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    passportId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cash: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        required: true,
    }
});

const bankUser = mongoose.model('users', userSchema);

module.exports = {
    bankUser
};