# Philosophy Quotes API

**Wisdom as a Service.** A RESTful API serving curated philosophy quotes from the ancients to the moderns, with multi-language support and deep metadata.

---

## 🌍 For API Users (Quick Start)

If you just want to consume the API in your app, website, or script, this section is for you.

**Base URL**: `https://your-deployed-domain.com` (or `http://localhost:3000` locally)

### key Endpoints

-   **Get Random Quote**: `GET /quotes/random`
    -   *Try it*: `curl https://.../quotes/random?query=truth`
-   **Browse All**: `GET /quotes`
    -   *Try it*: `curl https://.../quotes?author=Plato&limit=5`
-   **Get by ID**: `GET /quotes/:id`

### Powerful Filtering
Refine your search with these parameters:
-   `lang`: `en`, `es`, `fr`, `pt` (Defaults to English)
-   `query`: Search content/author (Supports `?`, `!`, etc.)
-   `author`: Filter by name (e.g., "Nietzsche")
-   `era`: Filter by era (e.g., "Ancient")
-   `maxLength`: Limit tweet length (e.g., `140`)

### Authentication
Requests require a simple header:
`X-RapidAPI-Proxy-Secret: <your-secret-key>`

---

## 🛠️ For Developers (Build & Deploy)

If you want to host your own instance or contribute to the code.

### Installation
1.  **Clone**: `git clone https://github.com/oriolvo/Philosophy-Quotes-API.git`
2.  **Install**: `npm install`
3.  **Config**: `cp .env.example .env` and set your secrets.

### Development
-   **Start Server**: `npm start` (Runs on port 3000)
-   **Run Tests**: `npm test`
-   **Structure**:
    -   `src/index.js`: Main server entry point.
    -   `src/data/`: JSON database.
    -   `public/`: Landing page assets.

### Requirements
-   Node.js v18+
-   Express

---

## 📄 License
Released under the **PolyForm Noncommercial License 1.0.0**.
Free for personal and educational use. Commercial use requires permission.
