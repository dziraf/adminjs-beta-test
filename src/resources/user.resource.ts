import argon from 'argon2';
import passwordsFeature from '@adminjs/passwords';
import { ResourceWithOptions } from 'adminjs';

import { User } from '../models';

const UserResource: ResourceWithOptions = {
  resource: User,
  options: {
    navigation: {
      name: 'App',
      icon: 'Settings',
    },
    properties: {
      password: { isVisible: false },
      userPassword: { isRequired: true },
    },
  },
  features: [passwordsFeature({
    properties: {
      password: 'userPassword',
      encryptedPassword: 'password',
    },
    hash: argon.hash,
  })],
};

export default UserResource;
