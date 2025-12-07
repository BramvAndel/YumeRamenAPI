const express = require("express");
const cors = require("cors");
const path = require("path");
const orderRoutes = require("./routes/orders");
const dishesRoutes = require("./routes/dishes");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const logger = require("./utils/logger");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const config = require("../config/config");
const helmet = require("helmet");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const prefix = `/api/${config.version}`;

// Apply global rate limiter to all API routes
app.use(prefix, apiLimiter);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Yume Ramen Noodles API",
      version: "1.0.0",
      description: "API documentation for Yume Ramen Noodles",
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.version}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Serve uploaded files as CDN with cross-origin policy
app.use("/uploads", (req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check Endpoint
app.get(`${prefix}/health`, (req, res) => {
  res.send("API is healthy");
});

app.use(`${prefix}/orders`, orderRoutes);
app.use(`${prefix}/dishes`, dishesRoutes);
app.use(`${prefix}/users`, userRoutes);
app.use(`${prefix}/auth`, authRoutes);

// Handle 404 for undefined routes
app.use((req, res) => {
  logger.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
