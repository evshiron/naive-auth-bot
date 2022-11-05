import { Bot, BotConfig, Context, webhookCallback } from "grammy";
import { SocksProxyAgent } from 'socks-proxy-agent';
import { createHmac } from 'crypto';
import { AUTH_PAYLOAD_SECRET, AUTH_MESSAGE_TIMEOUT, SOCKS_PROXY, TELEGRAM_BOT_SECRET, WEB_PAYLOAD_KEY, WEB_SIGNATURE_KEY, WEB_URL, WEBHOOK_URL, PORT } from "./config";
import express from "express";

async function bootstrap() {
  const botConfig: BotConfig<Context> = {};

  if (SOCKS_PROXY) {
    const socksAgent = new SocksProxyAgent(SOCKS_PROXY);

    botConfig.client = {
      baseFetchConfig: {
        agent: socksAgent,
        compress: true,
      },
    };
  }

  // Create an instance of the `Bot` class and pass your authentication token to it.
  const bot = new Bot(TELEGRAM_BOT_SECRET!, botConfig); // <-- put your authentication token between the ""

  // You can now register listeners on your bot object `bot`.
  // grammY will call the listeners when users send messages to your bot.

  // Handle the /start command.
  bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

  // Handle the /auth command.
  bot.command("auth", async (ctx) => {
    if (!AUTH_PAYLOAD_SECRET) {
      await ctx.reply('forbidden');
      return;
    }

    if (!ctx.from) {
      await ctx.reply('bad request');
      return;
    }

    const payload = JSON.stringify({
      // identity
      id: String(ctx.from.id),
      // issuer
      is: 'tg',
      // timestamp
      t: ~~(Date.now() / 1000),
    });

    const hmac = createHmac('sha1', AUTH_PAYLOAD_SECRET);
    const signature = hmac.update(payload).digest();

    const base64Payload = Buffer.from(payload).toString('base64url');
    const base64Signature = signature.toString('base64url');
    let text;
    if (WEB_URL) {
      const url = new URL(WEB_URL);
      url.searchParams.set(WEB_PAYLOAD_KEY, base64Payload);
      url.searchParams.set(WEB_SIGNATURE_KEY, base64Signature);
      text = url.toString();
    } else {
      text = `${WEB_PAYLOAD_KEY}=${base64Payload}&${WEB_SIGNATURE_KEY}=${base64Signature}`
    }


    const message = await ctx.reply(text);

    setTimeout(() => {
      bot.api.deleteMessage(ctx.chat.id, message.message_id);
    }, AUTH_MESSAGE_TIMEOUT);
  });

  // Now that you specified how to handle messages, you can start your bot.
  // This will connect to the Telegram servers and wait for messages.

  // Start the bot.
  if (WEBHOOK_URL) {
    console.info('WEBHOOK_URL is set, starting in webhook mode.');

    await bot.api.setWebhook(WEBHOOK_URL);

    const app = express();
    app.use(express.json());

    app.use(webhookCallback(bot, 'express'));

    app.get('/healthz', (req, res) => {
      res.end('running');
    });

    app.listen(PORT);
  } else {
    console.info('WEBHOOK_URL is not set, starting in standalone mode.');

    bot.start();
  }
}

bootstrap().catch((err) => console.error(err));
