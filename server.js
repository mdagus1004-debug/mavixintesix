const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let file = req.url === '/' ? 'index.html' : req.url.slice(1);
  let filePath = path.join(__dirname, file);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Tidak jumpa');
      return;
    }
    res.end(data);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log('MAVIX jalan di ' + PORT));
