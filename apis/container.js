var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	req.app.locals.orcinus.listContainers(function (err, data) {
		if(err) {
			res.status(err.statusCode).send({error : err.reason});
		}
		else {
			res.send(data);
		}
	});
});

router.post('/inspect', function (req, res, next) {
	var cnt = req.app.locals.orcinus.getContainer(req.body.id);

	cnt.inspect(function(err, data) {
		if (err) {
			res.status(err.statusCode).send({error : err.reason});
		}
		else {
			res.send(data);
		}
	});
});

module.exports = router;