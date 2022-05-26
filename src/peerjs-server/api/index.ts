import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { IConfig } from '../config';
import { IMessageHandler } from '../messageHandler';
import { IRealm } from '../models/realm';
import { AuthMiddleware } from './middleware/auth';
import CallsApi from './v1/calls';
import PublicApi from './v1/public';

let roomId = 0;

export const Api = ({
  config,
  realm,
  messageHandler,
}: {
  config: IConfig;
  realm: IRealm;
  messageHandler: IMessageHandler;
}): express.Router => {
  const authMiddleware = new AuthMiddleware(config, realm);

  const app = express.Router();

  const jsonParser = bodyParser.json();

  app.use(cors());

  // Create room
  app.post('/room', async (req, res) => {
    roomId++;
    const roomStr = roomId.toString();
    let room = '';
    for (let i = 0; i < 12; i++) {
      if (!roomStr[i]) {
        room += '0';
      }
    }
    room += roomStr;
    if (process.send) {
      process.send({
        type: 'create',
        value: room,
      });
    }
    await new Promise((resolve) => {
      process.on('message', (m) => {
        if (m.type === 'room') {
          resolve(m);
        }
      });
    });
    return res.status(201).json({
      type: 'room',
      value: room,
    });
  });

  app.use('/:key', PublicApi({ config, realm }));
  app.use(
    '/:key/:id/:token',
    authMiddleware.handle,
    jsonParser,
    CallsApi({ realm, messageHandler })
  );

  return app;
};
