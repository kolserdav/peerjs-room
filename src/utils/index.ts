import { chromium } from 'playwright';
import type { IncomingHttpHeaders } from 'http';

interface Env extends NodeJS.ProcessEnv {
  APP_URL: string;
}

const { APP_URL }: Env = process.env as Env;

const VIEWPORT = { width: 640, height: 480 };
const HEADLESS = true;
// eslint-disable-next-line prefer-const
let recordVideo: any = { dir: 'videos/', size: VIEWPORT };
// TODO
recordVideo = undefined;

export const createRoom = async ({ roomId }: { roomId: string }) => {
  const browser = await chromium.launch({
    headless: HEADLESS,
    devtools: !HEADLESS,
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
  await page.goto(`${APP_URL}/${roomId}?room=1`);
  await page.waitForLoadState();
};

let roomId = 0;

export const getRoomId = () => {
  roomId++;
  const roomStr = roomId.toString();
  let room = '';
  for (let i = 0; i < 12; i++) {
    if (!roomStr[i]) {
      room += '0';
    }
  }
  room += roomStr;
  return room;
};

export const getUserId = ({ headers }: { headers: IncomingHttpHeaders }): string => {
  return new Date().getTime().toString();
};
