import { emailExists, createUser } from './queries/userQueries';
import { hashPassword } from '../utils/password';

const test = async () => {
  // Check if test email exists
  const exists = await emailExists('test@example.com');
  console.log('Email exists:', exists);

  // Create a test user (run only once!)
  if (!exists) {
    const hashed = await hashPassword('Test123!@#');
    const user = await createUser('test@example.com', 'testuser', hashed);
    console.log('Created user:', user);
  }
};

test();