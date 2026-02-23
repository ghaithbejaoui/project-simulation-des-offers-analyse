const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS test');  // Simple query to check connection
    res.json({ message: 'DB connection successful!', result: rows });
  } catch (error) {
    res.status(500).json({ message: 'DB connection failed', error: error.message });
  }
});


// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telecom Offers API / API des Offres Télécom',
      version: '1.0.0',
      description: 'API for managing telecom offers and customer profiles. / API pour gérer les offres télécom et les profils clients.',
      contact: {
        name: 'API Support / Support API'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server / Serveur de développement',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Swagger JSON spec (for tools/frontend)
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
// TODO: Import and use routes here
// const offersRoutes = require('./routes/offers');
// app.use('/api/offers', offersRoutes);

const offersRoutes = require('./routes/offers');
app.use('/api/offers', offersRoutes);  // Attach the offers door at /api/offers.

const customerProfilesRoutes = require('./routes/customer_profiles');
app.use('/api/customer-profiles', customerProfilesRoutes);  // Attach the customer profiles door at /api/customer-profiles.

const OptionsRoutes = require('./routes/options');
app.use('/api/options', OptionsRoutes);

const offerOptionsRoutes = require('./routes/offer_options');
app.use('/api/offer-options', offerOptionsRoutes);

const simulationRoutes = require('./routes/simulation');
app.use('/api/simulation', simulationRoutes);


// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Telecom Offers API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});