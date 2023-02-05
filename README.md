# Api proxy server

Enables you to hide your API keys from clients.

-----------

## Quick start:

1. run ```npm install```
2. create .env from .env.example and paste your api key
3. if you want to use local mongodb then run ```docker-compose up``` to start container
4. edit `./seeds/seed.js` to add your tokens and then run ```node ./seeds/seed.js``` to seed DB
5. then run ```node index.js``` to start proxy server
