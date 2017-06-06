var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config')

var mysql = require('mysql');
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
})

connection.connect();

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
	request.get(nowPlayingUrl, (error, response,movieData)=>{
		var movieData = JSON.parse(movieData);
		res.render('movie-list', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Welcome to my movie app. These are now now playing:"

		});
	})
});

// router.get('/search', function(req, res) {
// 	res.send("The get search page");
// });

router.post('/search', function(req, res) {
	// res.json(req.body)
	var termUserSearchedFor = req.body.searchString
	var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;
	request.get(searchUrl, (error, response,movieData)=>{
		// res.json(JSON.parse(movieData))
		var movieData = JSON.parse(movieData);
		res.render('movie-list', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: `You searched for ${termUserSearchedFor}:`
		});
	});

	// res.send("The post search page");

});

router.get('/movie/:id', (req, res)=>{
	var thisMovieId = req.params.id;
	var thisMovieUrl = `${apiBaseUrl}/movie/${thisMovieId}?api_key=${config.apiKey}`;
	var thisCastUrl = `${apiBaseUrl}/movie/${thisMovieId}/credits`
	// res.send(req.params.id);
	request.get(thisMovieUrl,(error, response,movieData)=>{
		var movieData = JSON.parse(movieData);
		// console.log(movieData)
		// console.log(thisCastUrl)
		// res.json(movieData)
		res.render('single-movie',{
			movieData: movieData,
			imageBaseUrl: imageBaseUrl,
			titleHeader: movieData.title
		})
	})

})



module.exports = router;
