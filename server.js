const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.listen(6906);
app.use(express.static('public'));
app.use(bodyParser.json({limit: '500mb'}));
const url = require('url');
app.set('trust proxy', true);

// Ziggeo - video API
Ziggeo = require('ziggeo');
const myURL = new url.URL(process.env.ZIGGEO_URL);
const ZiggeoSdk = new Ziggeo(myURL.username, myURL.password, myURL.searchParams.get('encryption_key'));

// MailGun - mail API
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const auth = {
  auth: {
    api_key: process.env.API_KEY,
    domain: 'ziggeo.vimgirl.com'
  }
};
const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// Timber - logging API
const timber = require('timber');
const transport = new timber.transports.HTTPS(process.env.TIMBER_API_KEY);
timber.install(transport);
app.use(timber.middlewares.express({
  capture_request_body: true
}));

app.post('/mail', (req, res) => {
  const mailTo = req.body.mailTo;

  nodemailerMailgun.sendMail({
    from: 'hello@vimgirl.com',
    to: mailTo,
    subject: `You've got VidMail!`,
    text: `To view your VidMail, go to https://hello.vimgirl.com/videos/?email=${mailTo}!`
  }, (err, info) => {
    if (err) {
      console.error("VidMail was not sent.", {
        event: { mail_fail: { err } }
      });
    }
    else {
      console.info("VidMail sent!", {
        event: { mail_success: { info } }
      });
    }
  });
});

app.get('/videos', (req, res) => {
  ZiggeoSdk.Videos.index({tags: req.query.email}, (vidInfos) => {
    const videos = vidInfos.reduce((acc, vidInfo) => {
      acc += `<div class="vid-singles"><ziggeoplayer ziggeo-video="${vidInfo.token}" ziggeo-width=320 ziggeo-height=240 ziggeo-theme="modern" ziggeo-themecolor="red"></ziggeo></div>`;
      return acc;
    }, '');

    res.send(`
    <head>
    <link rel="stylesheet" href="//assets-cdn.ziggeo.com/v2-stable/ziggeo.css" />
    <script src="//assets-cdn.ziggeo.com/v2-stable/ziggeo.js"></script>
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Lobster" />
    <link rel="stylesheet" type="text/css" href="../index.css"></link>
    </head>
    <body>
    <div class="vid-container">
    <div class="vid-title">
    <div class="title">Welcome to your <text class="vid-mail">VidMailBox</text>, <u>${req.query.email}</u>!</div>
    </div>
    <div class="vid-center">${videos}</div>
    </div>
    <script>
  const ziggeoApp = new ZiggeoApi.V2.Application({
    token: "f181815deef925afd6e72d76fb78bf0d"
  });
    </script>
    </body>
  `);
  });
});

