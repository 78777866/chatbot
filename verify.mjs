import { createHash } from 'crypto';

const password = 'Kayushan204070';
const hash = createHash('sha256').update(password).digest('hex');
console.log('Password:', password);
console.log('Hash:', hash);
