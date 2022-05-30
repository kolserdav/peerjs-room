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
    dumpio: true,
    args: [
      '--disable-software-rasterizer',
      '--no-sandbox',
      '--allow-file-access-from-files',
      '--disable-gesture-requirement-for-media-playback',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });
  const page = await browser.newPage();
  const f12 = await page.target().createCDPSession();
  await f12.send('Network.enable');
  await f12.send('Page.enable');
  const handleWebSocketFrameReceived = (params: any) => {
    console.log(21, params);
    const payload = params.response.payloadData;
  };
  f12.on('Network.webSocketFrameReceived', handleWebSocketFrameReceived);
  await page.setViewport(VIEWPORT);
  await page.goto(`${APP_URL}/${roomId}?room=1`);
  if (recordVideo) {
    const Config = {
      followNewTab: true,
      fps: 25,
      ffmpeg_Path: null,
      videoFrame: VIEWPORT,
      aspectRatio: '16:9',
    };
    const recorder = new PuppeteerScreenRecorder(page, Config);
    const savePath = path.resolve(__dirname, `../../tmp/${roomId}.mp4`);
    await recorder.start(savePath);
    return { page, recorder };
  }

  return { page };
};

export const getUserId = ({ headers }: { headers: IncomingHttpHeaders }): string => {
  return new Date().getTime().toString();
};
