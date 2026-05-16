const express = require('express');
const router = express.Router();
const searchController = require('./search.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, searchController.globalSearch);

module.exports = router;
