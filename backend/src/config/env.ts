export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    database: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      name: process.env.DATABASE_NAME || 'residential_db',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
    },
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-for-dev',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret',
      refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    },
    
    qr: {
      secret: process.env.QR_SECRET || 'fallback-qr-secret',
    },
    
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    },
  };