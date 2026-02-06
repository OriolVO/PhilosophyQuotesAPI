const express = require('express');
const cors = require('cors');
const quotes = require('./data/quotes.json');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const setRateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const NodeCache = require('node-cache');
const morgan = require('morgan');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers (onclick)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow inline styles & Google Fonts
      fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts
      imgSrc: ["'self'", "data:"],
    },
  },
}));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Serve Static Landing Page
app.use(express.static(path.join(__dirname, '../public')));

// Rate Limiting
const limiter = setRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  headers: true,
});
app.use(limiter);

// Root Route - Handled by express.static now
// If index.html is missing, fallthrough behavior (optional)

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

// Apply secret check to all /quotes and meta routes
app.use(['/quotes', '/authors', '/fields'], checkRapidApiSecret);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Helper function to get unique values
const getUniqueValues = (key) => {
  const values = new Set(quotes.map(q => q[key]));
  return Array.from(values);
};

// GET /quote (Redirect legacy/typo)
app.get('/quote', (req, res) => {
  res.redirect(301, '/quotes');
});

// GET /quotes/random (Preserve "Random" logic, must be before :id)
app.get('/quotes/random', (req, res) => {
  let filteredQuotes = quotes;

  // Full-Text Search
  if (req.query.query) {
    const searchTerm = req.query.query.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => {
      const authorMatch = q.author.toLowerCase().includes(searchTerm);
      const contentMatch = Object.values(q.content).some(text => 
        text && text.toLowerCase().includes(searchTerm)
      );
      return authorMatch || contentMatch;
    });
  }

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
      q.era && q.era.toLowerCase().includes(eraQuery)
    );
  }

  // Filter by field
  if (req.query.field) {
    const fieldQuery = req.query.field.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => 
      q.field.toLowerCase().includes(fieldQuery)
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

// GET /quotes/:id (Specific Quote)
app.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: { code: 400, message: "Invalid ID format" } });
  }

  const quote = quotes.find(q => q.id === id);
  if (!quote) {
    return res.status(404).json({ error: { code: 404, message: "Quote not found" } });
  }

  res.json(quote);
});

// GET /quotes (Collection with Pagination)
app.get('/quotes', (req, res) => {
  let filteredQuotes = quotes;
  const lang = req.query.lang || 'en';

  // Apply filters (duplicate logic from random, could be refactored)
  if (req.query.author) {
    const authorQuery = req.query.author.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => q.author.toLowerCase().includes(authorQuery));
  }
  if (req.query.field) {
    const fieldQuery = req.query.field.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q => q.field.toLowerCase().includes(fieldQuery));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = filteredQuotes.slice(startIndex, endIndex).map(q => {
     // Apply lang filter to list items too
     const mapped = { ...q };
     mapped.content = q.content[lang] || q.content['en'];
     return mapped;
  });

  res.json({
    count: filteredQuotes.length,
    page: page,
    totalPages: Math.ceil(filteredQuotes.length / limit),
    results: results
  });
});

// GET /authors
app.get('/authors', (req, res) => {
  const cachedAuthors = cache.get('authors');
  if (cachedAuthors) {
    return res.json(cachedAuthors);
  }
  const authors = getUniqueValues('author');
  cache.set('authors', authors);
  res.json(authors);
});

// GET /fields
app.get('/fields', (req, res) => {
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
