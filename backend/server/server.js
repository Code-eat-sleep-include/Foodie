require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../server/User');
const OAuth = require('../server/oauth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/recipeApp');

const trainData = JSON.parse(fs.readFileSync('../data/train.json', 'utf-8'));

app.get('/api/recipes', (req, res) => {
    const query = req.query.q?.toLowerCase();
    if (!query) {
        return res.json(Object.values(trainData));
    }
    const results = Object.values(trainData).filter((recipe) =>
        recipe.title && typeof recipe.title === 'string' &&
        recipe.title.toLowerCase().includes(query)
    );
    if (results.length === 0) {
        return res.status(404).json({ message: 'No matching recipes found' });
    }
    res.json(results);
});

app.get('/api/restaurants', (req, res) => {
    const query = req.query.q?.toLowerCase();
    const cuisine = req.query.cuisine?.toLowerCase();
    const area = req.query.area?.toLowerCase();

    const restaurants = [];

    fs.createReadStream('../data/restaurants.csv')
        .pipe(csv({ separator: '|' }))
        .on('data', (data) => {
            if (data.NAME && data.CUSINE_CATEGORY && data.CITY && data.REGION) {
                const matchesCuisine = !cuisine || data.CUSINE_CATEGORY.toLowerCase().includes(cuisine);
                const matchesArea = !area || data.CITY.toLowerCase().includes(area) || data.REGION.toLowerCase().includes(area);
                const matchesQuery = !query || data.NAME.toLowerCase().includes(query);

                if ((cuisine && area && matchesCuisine && matchesArea) || (!cuisine && matchesQuery)) {
                    restaurants.push(data);
                }
            }
        })
        .on('end', () => {
            if (restaurants.length === 0) {
                return res.status(404).json({ message: 'No matching restaurants found' });
            }
            res.json(restaurants);
        });
});

app.use('/oauth', OAuth);

app.post('/auth/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.fullName }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, message: 'Sign in successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error during sign-in' });
  }
});

app.get('/auth/google', async (req, res) => {
    try {
        const authorizeUrl = OAuth.generateAuthUrl();
        res.json({ url: authorizeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error generating Google OAuth URL' });
    }
});

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
  
    try {
      const tokens = await OAuth.getToken(code);
  
      const userInfoResponse = await OAuth.oAuth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });
      const userInfo = userInfoResponse.data;
  
      let user = await User.findOne({ email: userInfo.email });
  
      if (!user) {
        user = new User({
          fullName: userInfo.name,
          email: userInfo.email,
          password: 'google-auth',
        });
        await user.save();
      }
  
      const token = jwt.sign({ id: user._id, name: user.fullName }, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.redirect(`http://localhost:5173/profile?token=${token}`);
    } catch (error) {
      console.error('Error during Google OAuth callback:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });  

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));