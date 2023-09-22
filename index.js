import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
const PORT = process.env.PORT || 5500;
import app from './app.js';
const server = http.createServer(app);
console.log(`Server Started at Port ${PORT}`);
server.listen(PORT);
