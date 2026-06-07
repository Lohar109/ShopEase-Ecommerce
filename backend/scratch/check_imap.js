const tls = require('tls');
require('dotenv').config();

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASS;

console.log('Connecting to imap.gmail.com on port 993...');
const socket = tls.connect(993, 'imap.gmail.com', { rejectUnauthorized: false }, () => {
  console.log('Connected to IMAP server.');
});

let step = 0;
let buffer = '';

socket.setEncoding('utf8');
socket.on('data', (chunk) => {
  buffer += chunk;
  
  if (step === 0 && buffer.includes('* OK')) {
    console.log('IMAP server ready. Sending LOGIN...');
    socket.write(`A1 LOGIN ${user} "${pass}"\r\n`);
    step = 1;
    buffer = ''; // clear buffer
  }
  
  if (step === 1 && buffer.includes('A1 OK')) {
    console.log('LOGIN successful! Selecting INBOX...');
    socket.write(`A2 SELECT INBOX\r\n`);
    step = 2;
    buffer = ''; // clear buffer
  } else if (step === 1 && (buffer.includes('A1 NO') || buffer.includes('A1 BAD'))) {
    console.error('LOGIN failed:', buffer);
    socket.write('A4 LOGOUT\r\n');
    socket.end();
  }
  
  if (step === 2 && buffer.includes('A2 OK')) {
    const match = buffer.match(/\* (\d+) EXISTS/);
    let count = 0;
    if (match) {
      count = parseInt(match[1], 10);
    }
    console.log(`INBOX selected. Total messages: ${count}`);
    
    if (count > 0) {
      console.log(`Fetching latest message #${count}...`);
      socket.write(`A3 FETCH ${count} (BODY[HEADER.FIELDS (SUBJECT FROM DATE)])\r\n`);
      step = 3;
      buffer = '';
    } else {
      console.log('INBOX is empty.');
      socket.write('A4 LOGOUT\r\n');
      socket.end();
    }
  } else if (step === 2 && (buffer.includes('A2 NO') || buffer.includes('A2 BAD'))) {
    console.error('SELECT failed:', buffer);
    socket.write('A4 LOGOUT\r\n');
    socket.end();
  }
  
  if (step === 3 && buffer.includes('A3 OK')) {
    console.log('--- FETCH SUCCESSFUL ---');
    console.log(buffer);
    console.log('------------------------');
    socket.write('A4 LOGOUT\r\n');
    socket.end();
  } else if (step === 3 && (buffer.includes('A3 NO') || buffer.includes('A3 BAD'))) {
    console.error('FETCH failed:', buffer);
    socket.write('A4 LOGOUT\r\n');
    socket.end();
  }
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});

socket.on('end', () => {
  console.log('Disconnected.');
});
