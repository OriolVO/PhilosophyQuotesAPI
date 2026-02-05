const express = require('express');
const cors = require('cors');
const quotes = require('./data/quotes.json');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const setRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = setRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  headers: true,
});
app.use(limiter);

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
  if (req.query.maxLength) {
    const maxLen = parseInt(req.query.maxLength);
    if (!isNaN(maxLen)) {
      filteredQuotes = filteredQuotes.filter(q => q.content.length <= maxLen);
    }
  }

  if (filteredQuotes.length === 0) {
    return res.status(404).json({ error: "No quotes found matching criteria" });
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  res.json(filteredQuotes[randomIndex]);
});

// GET /v1/authors
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
