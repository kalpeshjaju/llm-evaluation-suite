// Simple test function
function validateEmail(email) {
  if (!email) {
    throw new Error('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }

  return true;
}

module.exports = validateEmail;
