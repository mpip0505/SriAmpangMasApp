const bcrypt = require('bcrypt');

const password = 'password123';
const hashFromDB = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bl7NhU1Oa';

bcrypt.compare(password, hashFromDB, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match:', result);
    console.log('Expected: true');
  }
});

// Also generate a fresh hash for testing
bcrypt.hash(password, 12, (err, hash) => {
  console.log('\nFresh hash for password123:');
  console.log(hash);
});