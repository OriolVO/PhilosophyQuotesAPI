# Philosophy Quotes API

A lightweight, robust Node.js REST API that serves random philosophical quotes. Built with Express, ensuring performance, reliability, and easy integration.

## 🚀 Features

-   **Random Quotes**: Get a random wisdom nugget instantly.
-   **Filtering**: Filter by `author`, `field` (e.g., Ethics, Logic), or `tags`.
-   **Performance**: In-memory database for zero-latency responses.
-   **Security**: Rate limiting and secure HTTP headers optimized for public access.
-   **Documentation**: Integrated Swagger UI.

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

3.  **Start the server**
    ```bash
    npm start
    # OR for development with hot-reload (if nodemon is installed)
    node src/index.js
    ```

## 📖 API Usage

The API runs on `http://localhost:3000` by default.

### Endpoints

-   `GET /v1/quote/random` - Get a random quote.
    -   Query Params: `?author=Socrates`, `?field=Ethics`, `?tags=wisdom`
-   `GET /v1/authors` - List all available authors.
-   `GET /v1/fields` - List all philosophical fields.
-   `GET /health` - Service health check.
-   `GET /api-docs` - Interactive Swagger Documentation.

### Example Request

```bash
curl "http://localhost:3000/v1/quote/random?author=Nietzsche"
```

## 🧪 Running Tests

This project uses **Jest** and **Supertest** for integration testing.

```bash
npm test
```

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the detailed development plan and future phases.

## 📄 License

This project is licensed under the ISC License.
