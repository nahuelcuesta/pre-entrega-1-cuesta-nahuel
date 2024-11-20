import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import sessionRoutes from './routes/sessions.js';

import { connectDB } from './config/db.js';

const app = express();
const PORT = 3000;



app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

connectDB();

app.use('/api/sessions', sessionRoutes);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });

export default app;
