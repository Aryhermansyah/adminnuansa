console.log('Starting simple Express server');

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Endpoint utama
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  
  // Contoh validasi sederhana
  if (username === 'admin' && password === 'password') {
    const token = 'sample-token-' + Date.now();
    const userData = {
      id: 1,
      name: 'Admin Nuansa',
      role: 'admin',
    };
    
    console.log('Login successful, token:', token);
    
    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userData
    });
  } else {
    console.log('Login failed for user:', username);
    res.status(401).json({
      success: false,
      message: 'Username atau password salah'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 