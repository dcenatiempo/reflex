var express = require('express');
var router = express.Router();
var path = require('path');

/* GET spa. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
});

module.exports = router;
