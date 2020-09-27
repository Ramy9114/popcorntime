// require('dotenv').config()

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const Router = express.Router()
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const passport = require('passport')

const User = require('../../models/User');
const Session = require('../../models/Session');
const Address = require('../../models/Address');



var sessionStorage = require('sessionstorage')

const { ensureNotAuthenticated } = require('./ensureNotAuthenticated.js')


//Login Page
Router.get('/login', ensureNotAuthenticated, (req, res) => res.render('mvs/login'))

//Register Page
Router.get('/register', (req, res) => res.render('mvs/register'))

Router.post('/register', async (req, res) => {
    try{
        User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                //User exists
                res.redirect('/auth/register')
            }else{
                // const hashedPassword = await bcrypt.hash(req.body.password, 10)
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })

                const address = new Address({
                    _id: new mongoose.Types.ObjectId(),
                    User_id: user.id,
                    country: req.body.country,
                    city: req.body.city,
                    address: req.body.address,
                    postalCode: req.body.postalCode,
                })

                const session = new Session({
                    User_id: user._id
                })



                bcrypt.genSalt(10, (err, salt) =>
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if(err) throw err
                    user.password = hash;
                    user.save()
                        .then(user =>{
                            session.save()
                            address.save()
                            res.redirect('/auth/login')
                        })
                        .catch(err => console.log(err))
                }))



                console.log(user)
            }
        })
    }catch{
        res.redirect('/auth/register')
        console.log("process failed!")
    }


})

//Login handle
Router.post('/login', (req, res, next) =>{
    passport.authenticate('local', {
        successRedirect: '/mvs',
        failureRedirect: '/mvs/login',
        failureFlash: false
    })(req, res, next)
})

//Logout handle
Router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
    sessionStorage.removeItem("access_token");
    console.log("EMPTY OR NOT")
    console.log(sessionStorage.getItem("access_token"))
  });


module.exports = Router