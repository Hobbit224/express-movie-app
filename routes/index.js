var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config')
var bcrypt = require('bcrypt-nodejs');

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
		// console.log('+++++++++++++++++++++++++')
		// console.log(req.session)
		// console.log('+++++++++++++++++++++++++')
		res.render('movie-list', {
			movieData: movieData.results,
			imageBaseUrl: imageBaseUrl,
			titleHeader: "Welcome to my movie app. These are now now playing:",
			sessionInfo: req.session
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

router.get('/signup', function(req,res){
	var message = req.query.msg;
	if (message == 'badEmail'){
		message = 'This email is already in use'
	}
	res.render('signup', {message: message})
})

router.post('/signupProcess', function(req,res){
	// res.json(req.body)
	var name = req.body.name
	var email = req.body.email
	var password = req.body.password
	var hash = bcrypt.hashSync(password);
	console.log(hash)

	var selectQuery = "SELECT * FROM users WHERE email = ?";
	connection.query(selectQuery,[email], function(error, results){
		if(results.length == 0){
			var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
			connection.query(insertQuery,[name,email,hash], function(error,results){
				req.session.name = name;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/?msg=registered')
			})
		}else{
			res.redirect('/signup?msg=badEmail')
		}

	})

	
})

router.get('/login', function(req,res){
	res.render('login')

})

router.post('/processLogin', function(req,res){
	var email = req.body.email
	var password = req.body.password
	// var selectQuery = "SELECT * FROM users WHERE email = ? AND password = ?";
	var selectQuery = "SELECT * FROM users WHERE email = ?";

	connection.query(selectQuery, [email], function(error,results){
		if (results.length == 1){
			// Match found
			var match = bcrypt.compareSync(password, results[0].password)
			if(match === true){
				req.session.loggedin = true;
				req.session.name = results.name;
				req.session.email = results.email;
				res.redirect('/?msg=loggedin')

		}else{
			es.redirect('/login?msg=badLogin')
		}

			
		}else{
			res.redirect('/login?msg=badLogin')
		}
	})
})




module.exports = router;
