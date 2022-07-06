import { DataSource } from 'typeorm';

import { User } from '../models';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.DATABASE_SYNC === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  entities: [User],
  migrations: [],
  subscribers: [],
});

export default dataSource;
