import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import type { IncomingHttpHeaders } from 'http';
import { VIEWPORT, HEADLESS } from './constants';
import path from 'path';

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
}): Promise<{ page: puppeteer.Page; recorder?: PuppeteerScreenRecorder }> => {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    devtools: !HEADLESS,
    args: [
      '--no-sandbox',
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(`${APP_URL}/${roomId}?room=1`);
  page.on('console', (e) => {
    console.log(e);
  });
  if (recordVideo) {
    const Config = {
      followNewTab: true,
      fps: 25,
      ffmpeg_Path: null,
      videoFrame: VIEWPORT,
      aspectRatio: '4:3',
    };
    const recorder = new PuppeteerScreenRecorder(page, Config);
    const savePath = path.resolve(__dirname, `../../videos/${roomId}.mp4`);
    await recorder.start(savePath);
    return { page, recorder };
  }

  return { page };
};

export const getUserId = ({ headers }: { headers: IncomingHttpHeaders }): string => {
  return new Date().getTime().toString();
};
