const express = require('express');
const mongoose = require('mongoose');

const Router = express.Router();

const Movie = require('../../models/Movie');

// This is the route to have all the movies
Router.get('/', (req, res) => {
    Movie.find()
        .lean()
        .exec()
        .then(tws => {
            res.status(200).json(tws);
        })
        .catch(err => {
            error = err;
            console.error(error);
        });
})

// this is the route to have one specific tw
Router.get('/:movieId', (req, res) => {
    movieId = req.params.movieId;

    Movie.find({
        _id: movieId
    })
        .lean()
        .exec()
        .then(tw => {
            res.status(200).json(tw);
        })
        .catch(err => {
            error = err;
            console.error(error);
        });
})

//this is the route to create a movie
Router.post('/', (req, res) => {
    console.log(req.body.title);
    
    if (req.body.title && req.body.title != "") {
        const movie = new Movie({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            external_id: req.body.external_id,
            poster: req.body.poster
        })
        

        movie.save()
            .then(tw => {
                res.status(200).send(tw);
            })
            .catch(err => {
                res.status(500).json({error: err});    
            })
    } else {
        res.status(500).json({error: "Please put some values"});    
    }
})

// this is the route to delete a movie
Router.delete('/:movieId', (req, res) => {
    twId = req.params.twId;

    Movie.remove({
        _id: movieId
    })
        .exec()
        .then(result => {
            res.status(200).json({ 'message': 'Suppression du twitt !' });
        })
        .catch(err => {
            error = err;
            console.error(error);
        });
})

// this is the route to update a tw
Router.patch('/:movieId', (req, res) => {
    movieId = req.params.movieId;
    title = req.body.title;

    if (req.body.title && req.body.title != "") {
        Tw.update({ _id: movieId }, {
                $set: {
                    title: req.body.title,
                }
            })
            .exec()
            .then(tw => {
                res.status(200).json(tw);
            })
            .catch(err => {
                res.status(500).json({ error: err });
            });
    } else {
        res.status(500).json({ error: 'Merci de remplire tous les champs' });
    }
})

module.exports = Router;