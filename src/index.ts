import cluster from 'cluster';
import dotenv from 'dotenv';
dotenv.config();
import { PeerServer } from './peerjs-server/index';
import { createRoom, getRoomId } from './utils';

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('message', (m: Result) => {
    console.log('message', m);
    const { type, value } = m;
    let adminId = '';
    switch (type) {
      case 'create':
        // TODO admin
        adminId = value;
        (async () => {
          await createRoom({ roomId: getRoomId() });
        })();
        break;
      case 'connection':
        worker.send({ type: 'room', value: m.value });
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
