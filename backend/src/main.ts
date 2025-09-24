// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as express from 'express';
import * as multer from 'multer';
import * as fs from 'fs';
import { join, extname } from 'path';

async function bootstrap() {
  // ⬇️ tanpa { cors: true }
  const app = await NestFactory.create(AppModule);

  // CORS eksplisit
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('YouApp API')
    .setDescription('Login / Profile / Chat')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ===== Uploads static & endpoint
  const uploadDir = join(process.cwd(), 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  // serve statis: GET http://localhost:3001/uploads/<filename>
  app.use('/uploads', express.static(uploadDir));

  // Multer
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + extname(file.originalname).toLowerCase());
    },
  });
  const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) return cb(null, true);
      cb(new Error('Invalid file type'));
    },
  });

  const ex = app.getHttpAdapter().getInstance() as express.Express;

  // (opsional) preflight
  ex.options('/api/files/upload', (_req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
  });

  // ⬇️ PERUBAHAN DI SINI: balikin URL absolut biar FE gak request ke :3000
  ex.post('/api/files/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const relPath = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${relPath}`; // contoh: http://localhost:3001/uploads/xxx.png
    return res.json({ url: absoluteUrl, filename: req.file.filename });
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend on http://localhost:${port} | Swagger: /api-docs`);
}
bootstrap();
