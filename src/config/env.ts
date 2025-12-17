import 'dotenv/config';

function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ FATAL ERROR: Environment variable '${key}' is missing.`);
  }
  return value;
}

function getOptional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`❌ FATAL ERROR: '${key}' must be a number.`);
  }
  return parsed;
}

export const env = {
  app: {
    nodeEnv: getOptional('NODE_ENV', 'development'),
    port: getNumber('PORT', 3000),
  },
  db: {
    host: getRequired('DB_HOST'),
    port: getNumber('DB_PORT', 5432),
    username: getRequired('DB_USERNAME'),
    password: getRequired('DB_PASSWORD'),
    database: getRequired('DB_NAME'),
  },
  redis: {
    host: getRequired('REDIS_HOST'),
    port: getNumber('REDIS_PORT', 6379),
    password: getOptional('REDIS_PASSWORD', ''), 
  },
};