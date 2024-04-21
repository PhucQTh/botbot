/* --------------------------- author: Phuc THUONG -------------------------- */

const { Telegraf, Input } = require('telegraf');
const {
  chartGenagator,
  getData,
  getPrice,
  priceFormat,
  getPricePercent,
} = require('./ultis');
const { addUser, dbInit, getUsers } = require('./db.js');
const TOKEN = '6985227556:AAGvvUX9ew1BBHT5373XQA3ExB32Wu2Zw-4';
const bot = new Telegraf(TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));
/* ------------------------------- Get message ------------------------------ */
bot.on('message', async (ctx) => {
  const message = ctx.update.message.text;
  /* ------------------------------- Get user name ------------------------------ */
  const userName = ctx.update.message.from.username;
  const ctxArr = message.split(' ');
  const crypto = ctxArr[1];
  const timePeriod = ctxArr[2];
  try {
    // Extract the command from the message.
    // The regular expression looks for a string starting with '/'
    // followed by one or more word characters (e.g., /command, /myCommand).
    // The exec() method returns the matched substring and its captured groups.
    // The captured group is the command itself (e.g., 'command').
    // The question mark after the array indexing ensures that the code doesn't throw an error
    // if the regular expression doesn't find a match (i.e., if the message doesn't start with '/').
    // The [1] indexing retrieves the value of the first captured group.
    // The i flag after the regular expression makes the search case-insensitive.
    // The ?. operator is the optional chaining operator, which returns undefined if the left-hand side is null or undefined,
    // instead of throwing a TypeError.
    const commandTemp = /^\/(\w+)/i.exec(message);
    const command = commandTemp ? commandTemp[1] : undefined;
    if (command === 'c' || command === 'chart') {
      /* ------------------------------- check coin ------------------------------- */
      const pricePercent = await getPricePercent(crypto);
      if (pricePercent === 'error') {
        ctx.reply(`@${userName} Không tìm thấy biểu đồ`);
      } else {
        const { lastPrice, priceChangePercent } = pricePercent;
        let priceEmoji = priceChangePercent > 0 ? '🟢' : '🔴';
        /* ------------------------ get crypto & time period ------------------------ */
        const data = await getData(crypto, timePeriod);
        /* -------------------------- create title & chart -------------------------- */
        const title = `Chart ${crypto} ${timePeriod}`.toUpperCase();
        const binary = await chartGenagator(data, title);
        /* -------------------------------------------------------------------------- */
        await ctx.replyWithPhoto(Input.fromBuffer(binary), {
          caption: `@${userName}\nPrice: ${priceFormat(
            lastPrice
          )}  ${priceEmoji}\n24h: ${priceChangePercent}%`,
          parse_mode: 'HTML',
        });
      }
    } else if (command === 'p' || command === 'price') {
      /* ------------------------------- check coin ------------------------------- */
      const data = await getPrice(crypto);
      if (data === 'error') {
        ctx.reply(`@${userName} Không tìm thấy biểu giá`);
      } else {
        const { symbol, price } = data;
        await ctx.reply(`${symbol}: ${priceFormat(price)}`);
      }
    } else if (command === 'all') {
      const users = await getUsers();
      const userList = users.map((user) => `@${user}`).join(' ');
      ctx.reply(`Vô kèo nè mọi người, ${userList}`);
    } else if (command === 'addme') {
      addUser(userName).then(ctx.reply(`@${userName} đang thêm vô với bot`));
    } else {
      ctx.reply('Hong hiểu...');
    }
  } catch (error) {}
});
dbInit();
bot.launch();
