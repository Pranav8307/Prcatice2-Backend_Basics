const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

app.use(express.json());

const USER = {
  username: 'user1',
  password: 'password123'
};

let userAccount = {
  balance: 1000
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ 
      message: 'No token provided' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        message: 'Invalid or expired token' 
      });
    }
    req.user = decoded;
    next();
  });
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      message: 'Username and password required' 
    });
  }

  if (username === USER.username && password === USER.password) {

    const token = jwt.sign(
      { username: username },
      JWT_SECRET,
      { expiresIn: '1h' } 
    );

    return res.status(200).json({ 
      token: token 
    });
  } else {
    return res.status(401).json({ 
      message: 'Invalid credentials' 
    });
  }
});

app.get('/balance', verifyToken, (req, res) => {
  res.status(200).json({ 
    balance: userAccount.balance 
  });
});

app.post('/deposit', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      message: 'Invalid amount' 
    });
  }
  userAccount.balance += amount;

  res.status(200).json({ 
    message: `Deposited $${amount}.`,
    newBalance: userAccount.balance 
  });
});

app.post('/withdraw', verifyToken, (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ 
      message: 'Invalid amount' 
    });
  }

  if (amount > userAccount.balance) {
    return res.status(400).json({ 
      message: 'Insufficient balance' 
    });
  }

  userAccount.balance -= amount;

  res.status(200).json({ 
    message: `Withdraw $${amount}.`,
    newBalance: userAccount.balance 
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    message: 'Internal server error' 
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
