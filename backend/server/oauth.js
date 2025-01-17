var express = require('express');
var router = express.Router();
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

router.post('/', async function (req, res) {
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.redirectURL
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'openid'],
      prompt: 'consent',
    });

    res.json({ url: authorizeUrl });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    res.status(500).json({ message: 'Error initiating Google login' });
  }
});

router.get('/', async function (req, res) {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code not provided' });
    }

    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.redirectURL
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const userInfoResponse = await oAuth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const userInfo = userInfoResponse.data;

    console.log('User Info:', userInfo);

    res.redirect(`http://localhost:5173/profile?token=${tokens.id_token}`);
  } catch (error) {
    console.error('Error in Google OAuth flow:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

module.exports = router;