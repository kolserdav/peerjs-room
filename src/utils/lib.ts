import puppeteer from 'puppeteer';
import { chromium, Page } from 'playwright';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import type { IncomingHttpHeaders } from 'http';
import { VIEWPORT, HEADLESS } from './constants';

interface Env extends NodeJS.ProcessEnv {
  APP_URL: string;
}

const { APP_URL }: Env = process.env as Env;

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

export const createRoom = async ({
  roomId,
  recordVideo = false,
}: {
  roomId: string;
  recordVideo?: boolean;
}): Promise<{ page: Page; recorder?: PuppeteerScreenRecorder }> => {
  const browser = await chromium.launch({
    headless: HEADLESS,
    devtools: !HEADLESS,
    args: [
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const context = await browser.newContext({ recordVideo: undefined });
  const page = await context.newPage();
  await page.setViewportSize(VIEWPORT);
  await page.goto(`${APP_URL}/${roomId}?room=1`);
  await page.waitForLoadState();
  return { page };
};

export const getUserId = ({ headers }: { headers: IncomingHttpHeaders }): string => {
  return new Date().getTime().toString();
};
