import cluster from 'cluster';
import dotenv from 'dotenv';
import { Page } from 'playwright';
dotenv.config();
import { PeerServer } from './peerjs-server/index';
import { createRoom, getRoomId } from './utils';

const rooms: Record<string, Page> = {};

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('message', (m: Result) => {
    console.log('message', m);
    const { type, value } = m;
    const dropuseReg = /^dropuser_/;
    let adminId = '';
    let roomId = '';
    switch (type) {
      case 'create':
        // TODO admin
        adminId = value;
        roomId = getRoomId();
        (async () => {
          rooms[roomId] = await createRoom({ roomId });
        })();
        break;
      case 'connection':
        if (/^0/.test(value)) {
          worker.send({ type: 'room', value: m.value });
        }
        break;
      case 'close':
        if (dropuseReg.test(value)) {
          roomId = value.replace(dropuseReg, '');
          if (rooms[roomId]) {
            rooms[roomId].close();
            delete rooms[roomId];
          }
        }
        break;
      default:
        console.warn('Default case', m);
    }
  });
  worker.on('disconnect', () => {
    console.error('Disconnect  ');
  });
} else if (process.send) {
  const peer = PeerServer({
    path: '/',
    port: 9000,
    host: '',
  });
} else {
  console.warn('Unhandled case');
}
