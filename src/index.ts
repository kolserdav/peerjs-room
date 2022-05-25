import cluster from 'cluster';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';
import { PeerServer } from './peerjs-server/index';

const VIEWPORT = { width: 1633, height: 768 };
// eslint-disable-next-line prefer-const
let recordVideo: any = { dir: 'videos/', size: VIEWPORT };
// TODO
// recordVideo = undefined;

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('message', (m) => {
    console.log(m);
  });
  worker.on('disconnect', () => {
    console.error('Disconnect');
  });
  (async () => {
    const browser = await chromium.launch({
      headless: true,
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
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(5000);
    await page.close();
  })();
} else if (process.send) {
  const peer = PeerServer({
    path: '/',
    port: 9000,
    host: '',
  });
} else {
  console.warn('Unhandled case');
}
