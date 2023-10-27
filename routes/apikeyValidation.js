// apiKeyValidation.js
const apiKeyValidation = (req, res, next) => {
    const providedApiKey = req.headers['api-key'];
    
    // Compare the provided API key with the correct key
    if (providedApiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }
    
    next();
  };
  
  module.exports = apiKeyValidation;
  