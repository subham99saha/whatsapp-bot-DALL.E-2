const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config()

const { Client } = require('whatsapp-web.js');
const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
  console.log(message.body)
  if (message.body.startsWith("/image ")) {
    let data = JSON.stringify({
      "prompt": message.body.replace('/image ',''),
      "n": 2,
      "size": "1024x1024"
    });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.openai.com/v1/images/generations',
      headers: { 
        'Authorization': 'Bearer ' + process.env.API_KEY, 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios.request(config)
    .then((response) => { 
      console.log(response.data);     
      if (response.data.hasOwnProperty('error')) {
        message.reply(response.data.error.message)
      } else {        
        if (response.data.data.length != 0) {
          let urls = response.data.data.map( x => x.url)
          urls.map(url => {
            message.reply(url)
          })
        } else {
          message.reply('Sorry, I could not process that! Try a different prompt :)')
        }
      }
    })
    .catch((error) => {
      console.log(error);
      message.reply('Sorry, I could not process that!')
    });
  }
});

client.initialize();