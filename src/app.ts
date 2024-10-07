import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {createProxyMiddleware} from 'http-proxy-middleware';
import {ClientRequest} from 'http';

const app: Application = express();

// Middleware setup
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.disable('x-powered-by');

const services = [
  {
    route: '/api1',
    target: 'https://catfact.ninja/fact',
  },
  {
    route: '/api2',
    target: 'https://dog.ceo/api/breeds/image/random',
  },
  {
    route: '/api3',
    target: 'https://api.openweathermap.org/data/2.5',
    // Add additional proxy options for this service
    on: {
      proxyReq: (proxyReq: ClientRequest) => {
        const apiKey = process.env.API_KEY;
        proxyReq.path += `&appid=${apiKey}`;
      },
    },
  },
];

services.forEach(({route, target, on}) => {
  const proxyOptions = {
    on,
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '',
    },
    secure: process.env.NODE_ENV === 'production', // Enable SSL verification in production
  };

  console.log(proxyOptions);
  app.use(route, createProxyMiddleware(proxyOptions));
});

export default app;
