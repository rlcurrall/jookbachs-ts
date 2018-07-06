const express = require('express');
const api = express.Router();

api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());

api.get('/getlibrary', function (req, res, next) {
    res.status(200).json(libraries[0].getAllTracks());
    next();
})

api.post('/authTest', function(req, res, next) {

	//console.log(req.body.sharedKey);

	if (req.body.sharedKey === config.sharedKey) {
		res.status(202).end();
	} else {
		res.status(401).end();
	}

	next();

});

// log api requests to console
api.use(function(req, res, next) {
	let time = new Date(Date.now());
	console.log('[ api    ](%s) %s %s', time.toJSON(), req.method, req.url);
});