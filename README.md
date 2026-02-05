# Philosophy Quotes API

A lightweight, robust Node.js REST API that serves random philosophical quotes. Built with Express, ensuring performance, reliability, and easy integration.

## 🚀 Features

-   **Random Quotes**: Get a random wisdom nugget instantly.
-   **Security**: `X-RapidAPI-Proxy-Secret` validation for authorized access.
-   **Filtering**: Filter by `author`, `field`, `era`, or `tags`.
-   **Internationalization (i18n)**: Get quotes in English (`en`) or Spanish (`es`).
-   **Rich Metadata**: Includes Wikipedia links and Era classifications.
-   **Performance**: In-memory database with Caching for static lists.
-   **Documentation**: Integrated Swagger UI & Logging.

## 🛠️ Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/PhiloAPI.git
    cd PhiloAPI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file:
    ```bash
    cp .env.example .env
    # Edit .env and set your RAPIDAPI_SECRET
    ```

4.  **Start the server**
    ```bash
    npm start
    ```

## 📖 API Usage

The API runs on `http://localhost:3000` by default.

### Authentication
All requests must include the `X-RapidAPI-Proxy-Secret` header matching your `.env` secret.

### Endpoints
-   `GET /v1/quote/random` - Get a random quote.
    -   `lang`: Language code (`en`, `es`). Default: `en`.
    -   `era`: Filter by era (e.g., `Ancient`).
    -   `author`: Filter by author name.
    -   `tags`: Filter by tags.
-   `GET /v1/authors` - List all available authors.
-   `GET /v1/fields` - List all philosophical fields.
-   `GET /health` - Service health check.
-   `GET /api-docs` - Interactive Swagger Documentation.

### Example Request

```bash
```bash
curl -H "X-RapidAPI-Proxy-Secret: your-secret" \
     "http://localhost:3000/v1/quote/random?author=Nietzsche&lang=es"
```
```

## 🧪 Running Tests

This project uses **Jest** and **Supertest** for integration testing.

```bash
npm test
```

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the detailed development plan and future phases.

## 📄 License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**. 

**You may NOT use this source code for commercial purposes.** See [LICENSE](LICENSE) for details.
