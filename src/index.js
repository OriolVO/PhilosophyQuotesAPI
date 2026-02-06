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

// ---------------------------
// Security & Middleware
// ---------------------------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.use(morgan('dev'));

// ---------------------------
// CORS
// ---------------------------
// Allow all origins (or replace '*' with your frontend domain in production)
app.use(cors());

// ---------------------------
// JSON parsing
// ---------------------------
app.use(express.json());

// ---------------------------
// Serve Static Landing Page
// ---------------------------
app.use(express.static(path.join(__dirname, '../public')));

// ---------------------------
// Rate Limiting
// ---------------------------
const limiter = setRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  headers: true,
});
app.use(limiter);

// ---------------------------
// RapidAPI Proxy Secret Validation
// ---------------------------
const checkRapidApiSecret = (req, res, next) => {
  const secret = process.env.RAPIDAPI_SECRET;
  if (!secret) return next(); // Dev mode skip

  const clientSecret = req.get('X-RapidAPI-Proxy-Secret');
  if (clientSecret !== secret) {
    return res.status(403).json({ 
      error: { code: 403, message: "Forbidden: Invalid RapidAPI Secret" } 
    });
  }
  next();
};

// Apply secret check to API routes
app.use(['/quotes', '/authors', '/fields'], checkRapidApiSecret);

// ---------------------------
// Documentation
// ---------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---------------------------
// Helper Functions
// ---------------------------
const getUniqueValues = (key) => Array.from(new Set(quotes.map(q => q[key])));

// ---------------------------
// Routes
// ---------------------------

// Redirect legacy /quote to /quotes
app.get('/quote', (req, res) => res.redirect(301, '/quotes'));

// GET /quotes/random
app.get('/quotes/random', (req, res) => {
  let filteredQuotes = quotes;
  const lang = req.query.lang || 'en';

  // Filters
  if (req.query.query) {
    const searchTerm = req.query.query.toLowerCase();
    filteredQuotes = filteredQuotes.filter(q =>
      q.author.toLowerCase().includes(searchTerm) ||
      Object.values(q.content).some(text => text && text.toLowerCase().includes(searchTerm))
    );
  }
  if (req.query.author) filteredQuotes = filteredQuotes.filter(q => q.author.toLowerCase().includes(req.query.author.toLowerCase()));
  if (req.query.era) filteredQuotes = filteredQuotes.filter(q => q.era && q.era.toLowerCase().includes(req.query.era.toLowerCase()));
  if (req.query.field) filteredQuotes = filteredQuotes.filter(q => q.field.toLowerCase().includes(req.query.field.toLowerCase()));
  if (req.query.maxLength) {
    const maxLen = parseInt(req.query.maxLength);
    if (!isNaN(maxLen)) filteredQuotes = filteredQuotes.filter(q => (q.content[lang] || q.content['en']).length <= maxLen);
  }

  if (!filteredQuotes.length) return res.status(404).json({ error: { code: 404, message: "No quotes found" } });

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  res.json({ ...quote, content: quote.content[lang] || quote.content['en'] });
});

// GET /quotes/:id
app.get('/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: { code: 400, message: "Invalid ID" } });

  const quote = quotes.find(q => q.id === id);
  if (!quote) return res.status(404).json({ error: { code: 404, message: "Quote not found" } });

  res.json(quote);
});

// GET /quotes (list with pagination)
app.get('/quotes', (req, res) => {
  let filteredQuotes = quotes;
  const lang = req.query.lang || 'en';

  if (req.query.author) filteredQuotes = filteredQuotes.filter(q => q.author.toLowerCase().includes(req.query.author.toLowerCase()));
  if (req.query.field) filteredQuotes = filteredQuotes.filter(q => q.field.toLowerCase().includes(req.query.field.toLowerCase()));

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = filteredQuotes.slice(startIndex, endIndex).map(q => ({ ...q, content: q.content[lang] || q.content['en'] }));

  res.json({
    count: filteredQuotes.length,
    page,
    totalPages: Math.ceil(filteredQuotes.length / limit),
    results
  });
});

// GET /authors
app.get('/authors', (req, res) => {
  const cachedAuthors = cache.get('authors');
  if (cachedAuthors) return res.json(cachedAuthors);
  const authors = getUniqueValues('author');
  cache.set('authors', authors);
  res.json(authors);
});

// GET /fields
app.get('/fields', (req, res) => {
  const cachedFields = cache.get('fields');
  if (cachedFields) return res.json(cachedFields);
  const fields = getUniqueValues('field');
  cache.set('fields', fields);
  res.json(fields);
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ---------------------------
// Error Handling
// ---------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  const code = err.status || 500;
  res.status(code).json({ error: { code, message: err.message || "Internal Server Error" } });
});

// ---------------------------
// Start Server
// ---------------------------
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
