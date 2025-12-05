const express = require("express");
const cors = require("cors");
const path = require('path');
const orderRoutes = require('./routes/orders');
const dishesRoutes = require('./routes/dishes');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
    
const prefix = `/api/${process.env.VERSION}`;

// Apply global rate limiter to all API routes
app.use(prefix, apiLimiter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Yume Ramen Noodles API',
      version: '1.0.0',
      description: 'API documentation for Yume Ramen Noodles'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/${process.env.VERSION}`,
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Endpoint
app.get(`${prefix}/health`, (req, res) => {
  res.send('API is healthy');
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



module.exports = app;
