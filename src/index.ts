import cluster from 'cluster';
import path  from "path";
import fs from "fs";
import { PeerServer } from './peerjs-server/index'

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('message', (m) => {
    console.log(m)
  });

  worker.on('disconnect', () => {
    console.error('Disconnect')
  });
} else if (process.send) {
  
  const peer = PeerServer({
    path: '/',
    port: 9000,
    host: ''
  });

} else {
  console.warn('Unhandled case');
}