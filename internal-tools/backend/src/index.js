import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cciRoutes from './routes/cci.routes.js';
import techsprintRoutes from './routes/techsprint.routes.js';
import mouRoutes from './routes/mou.routes.js';
import openclawRoutes from './routes/openclaw.routes.js';

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/cci', cciRoutes);
app.use('/api/techsprint', techsprintRoutes);
app.use('/api/mou', mouRoutes);
app.use('/api/openclaw', openclawRoutes);

app.listen(PORT, () => {
  console.log(`Internal Tools backend running on port ${PORT}`);
});
