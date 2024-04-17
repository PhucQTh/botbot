/* --------------------------- author: Phuc THUONG -------------------------- */

const { Telegraf, Input } = require('telegraf');
// const {Input} = require('telegraf/utils');
const {
  chartGenagator,
  getData,
  getPrice,
  priceFormat,
  getPricePercent,
} = require('./ultis');
const TOKEN = '6985227556:AAGvvUX9ew1BBHT5373XQA3ExB32Wu2Zw-4';
const bot = new Telegraf(TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
/* ------------------------------- Get message ------------------------------ */
bot.on('message', async (ctx) => {
  const message = ctx.update.message.text;
  const ctxArr = message.split(' ');
  const crypto = ctxArr[1];
  const timePeriod = ctxArr[2];
  if (message.match(/chart/)) {
    /* ------------------------------- Get user name ------------------------------ */
    const userName = ctx.update.message.from.username;
    /* ------------------------ get crypto & time period ------------------------ */
    const data = await getData(crypto, timePeriod);
    /* -------------------------- create title & chart -------------------------- */
    const title = `Chart ${crypto} ${timePeriod}`.toUpperCase();
    const binary = await chartGenagator(data, title);
    const { lastPrice, priceChangePercent } = await getPricePercent(crypto);
    /* -------------------------------------------------------------------------- */
    await ctx.replyWithPhoto(Input.fromBuffer(binary), {
      caption: `@${userName}\nPrice: ${priceFormat(
        lastPrice
      )}\n24h: ${priceChangePercent}%`,
      parse_mode: 'HTML',
    });
  } else if (message.match(/price/)) {
    const { symbol, price } = await getPrice(crypto);
    await ctx.reply(`${symbol}: ${priceFormat(price)}`);
  } else {
    ctx.reply('Hong hiểu...');
  }
});
bot.launch();
