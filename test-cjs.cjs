const { WebSender } = require('./dist/index.cjs.js');

const ws = new WebSender({
  host: 'localhost',
  port: 25575,
  password: 'test',
});

console.log('WebSender örneği:', ws); 