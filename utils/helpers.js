// parse client ip from request
const parseIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
}

module.exports = {
  parseIp
}