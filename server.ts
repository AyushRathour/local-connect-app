import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { authMiddleware } from './server/middleware/auth';
import authRoutes from './server/routes/auth';
import servicesRoutes from './server/routes/services';
import categoriesRoutes from './server/routes/categories';
import bookingsRoutes from './server/routes/bookings';
import providersRoutes from './server/routes/providers';
import reviewsRoutes from './server/routes/reviews';
import contactRoutes from './server/routes/contact';
import adminRoutes from './server/routes/admin';
import notificationsRoutes from './server/routes/notifications';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global Auth Context extraction
  app.use(authMiddleware);

  // Health check
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Local Connect API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/services', servicesRoutes);
  app.use('/api/v1/categories', categoriesRoutes);
  app.use('/api/v1/bookings', bookingsRoutes);
  app.use('/api/v1/providers', providersRoutes);
  app.use('/api/v1/reviews', reviewsRoutes);
  app.use('/api/v1/contact', contactRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/notifications', notificationsRoutes);

  // Serve static assets / Vite
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Local Connect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
