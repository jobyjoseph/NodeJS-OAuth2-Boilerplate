var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        match: [/.+\@.+\..+/, "Please fill a valid email address"]
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        required: 'Username is required'
    },
    password: {
        type: String,
        validate: [
            function(password) {
                return password && password.length > 6;
            },
            'Password should be longer'
        ]
    },
    salt: {
        type: String
    },
    provider: {
        type: String,
        required: 'Provider is required'
    },
    created: {
        type: Date,
        default: Date.now
    }
});

UserSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
}).set(function(fullName) {
    var splitName = fullName.split(' ');
    this.firstName = splitName[0] || '';
    this.lastName = splitName[1] || '';
});

UserSchema.pre('save', function(next) {
    if (this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }
    next();
});

UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});

mongoose.model('User', UserSchema);
