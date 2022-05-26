import cluster from 'cluster';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
dotenv.config();
import { PeerServer } from './peerjs-server/index';

interface Env extends NodeJS.ProcessEnv {
  APP_URL: string;
}

const { APP_URL }: Env = process.env as Env;

const VIEWPORT = { width: 1633, height: 768 };
// eslint-disable-next-line prefer-const
let recordVideo: any = { dir: 'videos/', size: VIEWPORT };
// TODO
recordVideo = undefined;

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('message', (m) => {
    console.log('message', m);
    if (m.type === 'create') {
      (async () => {
        const browser = await chromium.launch({
          headless: false,
          devtools: true,
          args: [
            '--allow-file-access-from-files',
            '--disable-gesture-requirement-for-media-playback',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
          ],
        });
        const context = await browser.newContext({ recordVideo: recordVideo || undefined });
        const page = await context.newPage();
        await page.setViewportSize(VIEWPORT);
        await page.goto(`${APP_URL}/${m.value}?room=1`);
        await page.waitForLoadState();
        worker.send({ type: 'room', value: m.value });
      })();
    }
  });
  worker.on('disconnect', () => {
    console.error('Disconnect  ');
  });
  worker.on('room', (d) => {
    console.log(`room`, d);
  });
} else if (process.send) {
  const peer = PeerServer({
    path: '/',
    port: 9000,
    host: '',
  });
  process.send('ds');
} else {
  console.warn('Unhandled case');
}
