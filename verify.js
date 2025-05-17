const crypto = require('crypto');
const password = 'Kayushan204070';
const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Password:', password);
console.log('Hash:', hash);
