const express = require('express');
const cors = require('cors');
const quotes = require('./data/quotes.json');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const setRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const morgan = require('morgan');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = setRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  headers: true,
});
app.use(limiter);

// Root Route (Welcome Message)
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Philosophy Quotes API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      random_quote: "/v1/quote/random",
      authors: "/v1/authors",
      fields: "/v1/fields"
    }
  });
});

// RapidAPI Proxy Secret Validation
const checkRapidApiSecret = (req, res, next) => {
  const secret = process.env.RAPIDAPI_SECRET;
  if (!secret) return next(); // If no secret set, skip check (dev mode)
  
  const clientSecret = req.get('X-RapidAPI-Proxy-Secret');
  if (clientSecret !== secret) {
    return res.status(403).json({ 
      error: { code: 403, message: "Forbidden: Invalid RapidAPI Secret" } 
    });
  }
  next();
};

// Apply secret check to all /v1 routes
app.use('/v1', checkRapidApiSecret);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Helper function to get unique values
const getUniqueValues = (key) => {
  const values = new Set(quotes.map(q => q[key]));
  return Array.from(values);
};

// GET /v1/quote/random
app.get('/v1/quote/random', (req, res) => {
  let filteredQuotes = quotes;

  // Filter by author
  if (req.query.author) {
    const authorQuery = req.query.author.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => 
      q.author.toLowerCase().includes(authorQuery)
    );
  }

  // Filter by era
  if (req.query.era) {
    const eraQuery = req.query.era.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => 
      q.era && q.era.toLowerCase() === eraQuery
    );
  }

  // Filter by field
  if (req.query.field) {
    const fieldQuery = req.query.field.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => 
      q.field.toLowerCase().includes(fieldQuery)
    );
  }

  // Filter by tags
  if (req.query.tags) {
    const tagsQuery = req.query.tags.toLowerCase().split(',');
    filteredQuotes = filteredQuotes.filter(q => 
      q.tags.some(tag => tagsQuery.includes(tag.toLowerCase()))
    );
  }

  // Filter by maxLength
  const lang = req.query.lang || 'en';
  
  if (req.query.maxLength) {
    const maxLen = parseInt(req.query.maxLength);
    if (!isNaN(maxLen)) {
      filteredQuotes = filteredQuotes.filter(q => {
        const text = q.content[lang] || q.content['en'];
        return text.length <= maxLen;
      });
    }
  }

  if (filteredQuotes.length === 0) {
    return res.status(404).json({ error: { code: 404, message: "No quotes found matching criteria" } });
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  
  // Return specific language content
  const responseQuote = { ...quote };
  responseQuote.content = quote.content[lang] || quote.content['en']; // Fallback to EN
  
  res.json(responseQuote);
});

// GET /v1/authors
app.get('/v1/authors', (req, res) => {
  const cachedAuthors = cache.get('authors');
  if (cachedAuthors) {
    return res.json(cachedAuthors);
  }
  const authors = getUniqueValues('author');
  cache.set('authors', authors);
  res.json(authors);
});

// GET /v1/fields
app.get('/v1/fields', (req, res) => {
  const cachedFields = cache.get('fields');
  if (cachedFields) {
    return res.json(cachedFields);
  }
  const fields = getUniqueValues('field');
  cache.set('fields', fields);
  res.json(fields);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const code = err.status || 500;
  res.status(code).json({
    error: {
      code: code,
      message: err.message || "Internal Server Error"
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
