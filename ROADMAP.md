# Philosophy Quotes API - API Redesign Roadmap

## Vision
To create a clean, intuitive, and "version-less" API that adheres to RESTful best practices while maintaining the fun of randomness.

## The New Schema
We are moving away from `/v1` prefixing and singular endpoints like `/quote`. The new design treats quotes as a proper collection resource.

### 1. The Collection: `/quotes`
**`GET /quotes`**
- **Purpose**: Browse the entire library.
- **Why?**: Users shouldn't be forced to get quotes one by one. This allows building "browse" UIs.
- **Behavior**: Returns a **paginated** list of metadata-rich quotes.
- **Parameters**:
    - `page` (default: 1)
    - `limit` (default: 20, max: 100)
    - `lang` (default: 'en', fallback: 'en')

**`GET /quote` (Singular)**
- **Behavior**: **Redirect (301)** to `/quotes` OR return a friendly 400 error: *"Did you mean /quotes? We are a library, not a single book."*

### 2. The Feature: `/quotes/random`
**`GET /quotes/random`**
- **Purpose**: Wisdom on demand.
- **Why?**: The core value prop. Kept as a sub-resource for clarity.
- **Parameters**:
    - `query` (Full-text search)
    - `author` (Filter)
    - `field` (Filter)
    - `era` (Filter)

### 3. The Specific: `/quotes/:id`
**`GET /quotes/:id`**
- **Purpose**: Permalinks.
- **Why?**: Allows users to share specific quotes (e.g., "Check out quote #42").
- **Behavior**: Returns the full object for ID `42`.

### 4. Metadata Resources
- **`GET /authors`**: Returns list of all available authors.
- **`GET /fields`**: Returns list of all philosophical fields.

## Implementation Roadmap

### Phase 1: Router Refactor
- [ ] Remove `/v1` prefix from `src/index.js`.
- [ ] Group all Quote logic into a dedicated router or clean structure.

### Phase 2: Core Endpoints
- [ ] Implement `GET /quotes/:id`.
- [ ] Implement `GET /quotes` with pagination.
- [ ] Ensure `GET /quotes/random` (formerly `/v1/quote/random`) preserves current logic.

### Phase 3: Polish
- [ ] Standardization: Ensure all responses have a consistent wrapper (e.g., `{ data: ..., meta: ... }`).
- [ ] Error Handling: Specific messages for `/quote` vs `/quotes`.
- [ ] Update Swagger Documentation.
