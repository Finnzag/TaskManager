const mongoose = require('mongoose');
const _= require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// JWT secret
const jwtSecret = '46619852829005012441sadasfsgdfsgrtrjmjmnmhgj0208510774';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]

})

/** ****Instance methods**** */ 
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // return the documkent without the password and sessions. These should be kept private
    return _.omit(userObject, ['password', 'sessions']);

}

UserSchema.methods.generateAccessAuthToken = function() { 
    const user = this;
    return new Promise((resolve, reject) => {
        // create JSON web token and return it
        jwt.sign({_id: user._id.toHexString()}, jwtSecret, {expiresIn: '15m'}, (err, token) => {
            if (!err) {
                resolve(token);
            }else{
                reject();
            }
        })
    });
}

UserSchema.methods.generateRefreshAuthToken = function() {
    // this method generates a 64bit hex code string to use as the refresh token for the session
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function() {
    let user = this;
    
    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabse(user, refreshToken);
    }).then((refreshToken) => {
        // session saved to DB successfully
        // return the refresh token
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database. \n' + e);
    })
}

/** ****Model methods**** */ 
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}




UserSchema.statics.findByIdAndToken = function(_id, token) {
    // find the user by the ID and the token
    // used in auth middleware (verifySession)

    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;

    return User.findOne({email}).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user);
                else {
                    reject("Rejected");
                }
            })
        })
    })
}

UserSchema.statics.updatePassword = function(_id, currentPassword, newPassword) {
    let User = this;
    let UpdatedPassword;

    // Determines number of times that the encryption algorithm is run
    let costFactor = 10;

    return User.findOne({_id}).then((user) => {
        console.log("Found");
        bcrypt.compare(currentPassword, user.password, (err, res) => {
            if (res) {
                user.password = newPassword;
                console.log(user.password);
                bcrypt.genSalt(costFactor, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        UpdatedPassword = hash;
                        
                        User.findOneAndUpdate({
                            _id
                        }, { 
                            $set: {password: UpdatedPassword} 
                        }).then((UpdatedUser) => {
                            console.log("password updated");
                            console.log(UpdatedUser._id);
                            return UpdatedUser._id;
                        })
                        
                    })
                })
            } else {
                console.log(user);
                console.log("incorrect old password");
            }
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired
        return false;
    } else {
        // has expired
        return true;
    }
}

/** ****MIDDLEWARE**** */
UserSchema.pre('save', function(next) {
    let user = this;
    // Determines number of times that the encryption algorithm is run
    let costFactor = 10;
    
    if (user.isModified('password')) {
        // if the password field has been modified then this code will run

        // generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    }else {
        next();
    }

}); 


/** ****Helper methods**** */ 

let saveSessionToDatabse = (user, refreshToken) => {
    // save session to databse
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpireyTime();

        user.sessions.push({'token': refreshToken, expiresAt});

        user.save().then(() => {
            // session saved successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpireyTime = () => {
    let daysUntilExpire = '10';
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User }