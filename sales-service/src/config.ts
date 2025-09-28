import { z } from 'zod';

const DEFAULT_PORT = '3000';
const DEFAULT_MYSQL_HOST = 'localhost';
const DEFAULT_MYSQL_PORT = '3306';
const DEFAULT_MYSQL_DB = 'salesdb';
const DEFAULT_MYSQL_USER = 'appuser';
const DEFAULT_MYSQL_PASSWORD = 'apppassword';
const DEFAULT_ACTIVEMQ_HOST = 'localhost';
const DEFAULT_ACTIVEMQ_PORT = '61613';
const DEFAULT_ACTIVEMQ_USER = 'admin';
const DEFAULT_ACTIVEMQ_PASSWORD = 'admin';
const DEFAULT_SERVICE_NAME = 'sales-service';
const DEFAULT_JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const DEFAULT_VALID_API_KEYS = 'api-key-1,api-key-2,api-key-3';

const configSchema = z.object({
  PORT: z.string().transform(Number).default(DEFAULT_PORT),
  MYSQL_HOST: z.string().default(DEFAULT_MYSQL_HOST),
  MYSQL_PORT: z.string().transform(Number).default(DEFAULT_MYSQL_PORT),
  MYSQL_DB: z.string().default(DEFAULT_MYSQL_DB),
  MYSQL_USER: z.string().default(DEFAULT_MYSQL_USER),
  MYSQL_PASSWORD: z.string().default(DEFAULT_MYSQL_PASSWORD),
  ACTIVEMQ_HOST: z.string().default(DEFAULT_ACTIVEMQ_HOST),
  ACTIVEMQ_PORT: z.string().transform(Number).default(DEFAULT_ACTIVEMQ_PORT),
  ACTIVEMQ_USER: z.string().default(DEFAULT_ACTIVEMQ_USER),
  ACTIVEMQ_PASSWORD: z.string().default(DEFAULT_ACTIVEMQ_PASSWORD),
  SERVICE_NAME: z.string().default(DEFAULT_SERVICE_NAME),
  JWT_SECRET: z.string().default(DEFAULT_JWT_SECRET),
  VALID_API_KEYS: z.string().default(DEFAULT_VALID_API_KEYS),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse(process.env);

export const validateConfig = (): void => {
  try {
    configSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`- ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};
