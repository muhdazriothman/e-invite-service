import * as restify from 'restify';

import { createUserRoute } from './create';
import { loginUserRoute } from './login';

export const userRoutes = (server: restify.Server): void => {
  createUserRoute(server);
  loginUserRoute(server);
};