const express = require('express');
const mongoose = require('mongoose');
const Router = express.Router();

const Movie = require('../../models/Movie');
const User = require('../../models/User');
const Session = require('../../models/Session');


const { ensureAuthenticated } = require('./route-fixation.js')

var session_storage = require('sessionstorage')

var mysql = require('mysql')

const con = require('../../middlewares/mysql-connection')



var list = (req, res, msg = '') => {
    var error = false;
    //GETTING ALL THE MOVIES AVAILABLE
    Movie.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec()
        .then(movie => {

            //GETTING THE BEST OF MOVIES FROM THE DB
            Movie.find({ rating: { $gt: 4.5 } })
                .limit(5)
                .lean()
                .exec()
                .then(bm => {
                    Movie.find()
                        .limit(5)
                        .sort({ views: -1 })
                        .lean()
                        .exec()
                        .then(mw => {
                            res.render('mvs/list', {
                                mostWatchedMovies: mw,
                                bestMovies: bm,
                                movie: movie,
                                error: error,
                                msg: msg,
                            });
                        })

                })
                .catch(err => {
                    error = err;
                    console.error(error);
                });
        })
        .catch(err => {
            error = err;
            console.error(error);
        });


}

Router.get('/delete/:movieId', (req, res) => {
    movieId = req.params.movieId;

    Movie.remove({
        _id: movieId
    })
        .exec()
        .then(result => {
            res.redirect('/mvs/success/mvs well deleted !');
        })
        .catch(err => {
            error = err;
            console.error(error);
        });
});

Router.get('/', ensureAuthenticated, (req, res) => {
    list(req, res)
    console.log(session_storage)
    console.log(session_storage.getItem('username'))
});

Router.get('/detail/:movieId', async (req, res) => {
    Movie.findOne({ _id: req.params.movieId })
        .lean()
        .exec()
        .then(movie => {
            res.render('mvs/detail', {
                movie: movie
            });
        })
        .catch(err => {
            error = err;
            console.error(error);
        });

    if (session_storage.getItem('access_token')) {
        console.log(session_storage.getItem('access_token'))
        Session.findOne({ access_token: session_storage.getItem('access_token') })
            .exec()
            .then(session => {
                console.log('getting session info!')
                console.log(session)

                if (con) {
                    var dt = new Date()
                    var sql = 'INSERT INTO SEEN_MOVIE (MOVIE_ID, USER_ID, DATE) VALUES ("' + req.params.movieId + '", "' + session.User_id + '", CURDATE())';
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("SEEN CHECKED!!!");
                    });
                    Movie.findOne({ _id: req.params.movieId })
                        .lean()
                        .exec()
                        .then(movie => {
                            var numberOfViews = movie.views + 1
                            console.log("number of views now" + numberOfViews)
                            Movie.update({ _id: req.params.movieId }, {
                                $set: {
                                    views: numberOfViews,
                                }
                            })
                                .exec()
                                .then(movie => {
                                    console.log('One more VIEW!')
                                    // res.end()
                                })
                                .catch(err => {
                                    res.status(500).json({ error: err });
                                    // res.redirect('/mvs/danger/' + err);
                                });
                        })
                        .catch(err => {
                            error = err;
                            console.error(error);
                        });
                }
            })
            .catch(err => {
                error = err;
                console.error(error);
            });
    }
});

Router.get('/edit/:movieId', (req, res) => {
    Movie.findOne({ _id: req.params.movieId })
        .lean()
        .exec()
        .then(movie => {
            res.render('mvs/edit', {
                movie: movie
            });
        })
        .catch(err => {
            error = err;
            console.error(error);
        });
});

Router.get('/:type/:msg', (req, res) => {
    var msg = {
        type: req.params.type,
        msg: req.params.msg
    }
    list(req, res, msg)
});

Router.post('/', (req, res) => {
    if (req.body.title && req.body.title != "") {
        const movie = new Movie({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            external_id: req.body.external_id,
            poster: req.body.poster
        })

        movie.save()
            .then(movie => {
                res.redirect('/mvs/success/Movie well created');
            })
            .catch(err => {
                res.status(500).json({ error: err });
            })
    } else {
        // res.status(500).json({error: "Please put some values"});
        res.redirect('/mvs/danger/Please put some value');
    }
})

Router.post('/update/:movieId', (req, res) => {
    movieId = req.params.movieId;
    title = req.body.title;

    if (req.body.message && req.body.message != "") {
        Movie.update({ _id: movieId }, {
            $set: {
                title: req.body.title,
            }
        })
            .exec()
            .then(movie => {
                res.redirect('/mvs/success/movie well updated');
            })
            .catch(err => {
                // res.status(500).json({ error: err });
                res.redirect('/mvs/danger/' + err);
            });
    } else {
        // res.status(500).json({ error: 'Merci de remplire tous les champs' });
        res.redirect('/mvs/danger/Please put some value');
    }
})


Router.post('/rating/:movieId', (req, res) => {
    movieId = req.params.movieId;
    rating = req.body.star;
    comment = ""
    if (session_storage.getItem('access_token')) {
        Session.findOne({ access_token: session_storage.getItem('access_token') })
            .exec()
            .then(session => {
                console.log('displaying session')
                console.log(session)
                if (con) {
                    var sql = 'INSERT INTO RATING (MOVIE_ID, USER_ID, RATING, COMMENT) VALUES ("' + movieId + '", "' + session.User_id + '", "' + rating + '", "' + comment + '")';
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("1 RATING INSERTED!");

                        Movie.findOne({ _id: movieId })
                            .exec()
                            .then(movie => {
                                var newAvgRating = 0
                                //GET NUMBER OF RATINGS
                                con.query("SELECT * FROM RATING WHERE MOVIE_ID = ?", [movieId], function (err, result) {
                                    if (err) throw err;
                                    console.log(result)
                                    var numOfRatings = result.length
                                    console.log("movie rating: " + movie.rating)
                                    console.log("number of ratings: " + numOfRatings)
                                    console.log("submitted rating: " + rating)
                                    // if(numOfRatings == 1){
                                    //     newAvgRating = rating
                                    // }else if(result.length > 1){
                                    //     // newAvgRating = (parseFloat(movie.rating) * numOfRatings + rating) / (numOfRatings + 1)
                                    //     newAvgRating = parseFloat(movie.rating) * numOfRatings
                                    //     newAvgRating += rating
                                    //     newAvgRating /= numOfRatings + 1
                                    // }

                                    //CALCULATING NEW AVARAGE
                                    for (let index = 0; index < numOfRatings; index++) {
                                        newAvgRating += result[index].RATING
                                    }
                                    newAvgRating = newAvgRating / numOfRatings

                                    console.log("new Avg rating: " + newAvgRating)
                                    Movie.update({ _id: movieId }, {
                                        $set: {
                                            rating: Math.round(newAvgRating * 10) / 10,
                                        }
                                    })
                                        .exec()
                                        .then(movie => {
                                            console.log('MOVIE RATING UPDATED')
                                            list(req, res)
                                            // res.end()
                                        })
                                        .catch(err => {
                                            res.status(500).json({ error: err });
                                            // res.redirect('/mvs/danger/' + err);
                                        });
                                });
                            })
                    });
                }
            })
            .catch(err => {
                error = err;
                console.error(error);
            });


    }

})

Router.get('/blabla', (req, res) => {
    console.log("i am here")
});

module.exports = Router;