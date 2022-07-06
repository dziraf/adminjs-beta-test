/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/first */
require('dotenv').config({ path: `${__dirname}/../.env` });

import 'reflect-metadata';
import express from 'express';
import AdminJS, { CurrentAdmin } from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import argon from 'argon2';

import dataSource from './config/datasource';
import { User } from './models';
import { UserResource } from './resources';

AdminJS.registerAdapter(AdminJSTypeorm);

const isProduction = process.env.NODE_ENV === 'production';

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
  username: 'Administrator',
};

const createDefaultAdminIfMissing = async () => {
  const { email, password, username } = DEFAULT_ADMIN;

  let user = await User.findOneBy({ email });
  if (user) return;

  user = new User();
  user.email = email;
  user.password = await argon.hash(password);
  user.username = username;

  await user.save();
};

const authenticate = async (email: string, password: string): Promise<null | CurrentAdmin> => {
  const user = await User.findOneBy({
    email,
  });

  if (!user) return null;

  const isPasswordMatching = await argon.verify(user.password, password);

  if (isPasswordMatching) {
    return {
      id: String(user.id),
      email: user.email,
      title: user.username,
    };
  }

  return null;
};

const buildAdminRouter = (admin: AdminJS) => {
  const ConnectSession = ConnectPgSimple(session);
  const sessionConnection = {
    connectionString: process.env.DATABASE_URL,
  };
  const sessionStore = new ConnectSession({
    conObject: sessionConnection,
    tableName: 'session',
    createTableIfMissing: true,
  });

  const sessionOptions = {
    store: sessionStore,
    cookie: {
      httpOnly: isProduction,
      secure: isProduction,
    },
    saveUninitialized: true,
    resave: true,
    secret: process.env.COOKIE_PASSWORD || '',
    name: process.env.COOKIE_NAME || '',
  };

  return AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      cookieName: process.env.COOKIE_NAME,
      cookiePassword: process.env.COOKIE_PASSWORD || '',
      authenticate,
    },
    null,
    sessionOptions,
  );
};

const run = async () => {
  await dataSource.initialize();
  await createDefaultAdminIfMissing();

  const app = express();
  const admin = new AdminJS({
    rootPath: '/admin',
    resources: [UserResource],
  });
  if (!isProduction) admin.watch();

  const adminRouter = buildAdminRouter(admin);

  app.use(admin.options.rootPath, adminRouter);
  app.use('/', (req, res, next) => {
    if (req.url === admin.options.rootPath) return next();
    return res.redirect(admin.options.rootPath);
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('app started');
  });
};

run();
