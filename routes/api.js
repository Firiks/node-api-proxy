// node includes
const url = require('url');
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const querystring = require('querystring');
const { sanitizeUrl } = require("@braintree/sanitize-url");

// local files
const logger = require('../utils/logger');
const Cache = require('../models/cache');
const Tokens = require('../models/Tokens');

// handle POST reqeust from client
router.post('/', async (req, res, next) => {
  try {

    // read request
    const data = req.body;

    logger.debug('data', data);

    // check data
    if( !data || !data.host || !data.path ) {
      logger.error('No data or host');
      return res.sendStatus(400);
    }

    // check if host match in db or 404
    const token_data = await Tokens.findOne({ host: data.host });

    if( !token_data ) {
      logger.error('No token data');
      return res.sendStatus(400);
    }

    logger.debug('token_data', token_data)

    const host = data.host;
    const path = data.path;
    const args = data.args || {};
    const method = data.method.toUpperCase() || 'GET';
    const body = data.body || false;
    const headers = data.headers || {};

    if( token_data.type === 'header' ) { // check if token is header
      headers[token_data.token_name] = token_data.token_value;
    }

    if( token_data.type === 'query' ) { // check if token is query
      args[token_data.token_name] = token_data.token_value;
    }

    const urlObject = {
      protocol: 'https',
      hostname: host,
      pathname: path,
    }

    // check if args not empty
    if (Object.keys(args).length !== 0) {
      urlObject['query'] = args;
    } 

    // build url
    const apiUrl = sanitizeUrl(url.format(urlObject));

    logger.debug('apiUrl', apiUrl);

    if( method === 'GET' ) {
      // check cache if found then 200
      const cache_data = await Cache.findOne({ link: apiUrl });
      if(cache_data && cache_data.response && cache_data.time ) {

        const diff = Math.floor(( Date.now() - cache_data.time ) / 1000);

        if( diff > token_data.ttl ) { // cache expired
          // delete old cache
          cache_data.delete();
        } else { // cache not expired
          res.setHeader('Cache-Control', 'public, max-age=' + ( token_data.ttl - diff ));
          return res.status(200).json(cache_data.response);
        }
      }
    }

     // handle body
     if ( body && body['type'] && body['data'] ) {
      // json
      if( body['type'] === 'json' ) {
        request_data['body'] = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      }

      // form
      if( body['type'] === 'form' ) {
        request_data['body'] = querystring.stringify(body['data']);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      // multipart
      if( body['type'] === 'multipart' ) {
        const form = new FormData();

        for (let key in data['data']) {
          form.append(key, data[key]);
        }

        request_data['body'] = form;
        headers['Content-Type'] = 'multipart/form-data';
      } 
    }

    const request_data = {
      method: method,
      headers: headers,
    };

    logger.info(`Sending request to: ${apiUrl}`, request_data );

    // send request to API server
    fetch(apiUrl, request_data)
    .then(res => {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    })
    .then(json => {
      if( method === 'GET' ) { // cache only GET requests
        const new_cache = new Cache({
          link: apiUrl,
          response: json,
          time: Date.now()
        });

        res.setHeader('Cache-Control', 'public, max-age=' +  token_data.ttl);
        new_cache.save();
      }

      // send response as json
      res.status(200).json(json);
    })
    .catch(error => {
      logger.error(error);
      res.status(500);
    });

  } catch (err) {
    logger.error('Error:', err);
    next(err);
  }
});

module.exports = router;