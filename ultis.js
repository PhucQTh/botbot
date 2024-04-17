/* --------------------------- author: Phuc THUONG -------------------------- */
/* ------------------------- this file is for ultis ------------------------- */
/* ------------------------------------ - ----------------------------------- */
const axios = require('axios');
const QuickChart = require('quickchart-js');
/* ------------------------------- time define ------------------------------ */
const m = 60 * 1000;
const h = 60 * m;
const d = 24 * h;
const w = 7 * d;
const M = 30 * d;
const y = 365 * d;
const timeDefine = {
  m,
  h,
  d,
  w,
  M,
  y,
};
/* --------------------------- time interval split -------------------------- */
const timeSplit = (time) => {
  const matches = time.match(/(\d+)([a-zA-Z]+)/);
  if (matches) {
    const number = matches[1];
    const letter = matches[2];
    return { number, letter };
  }
  return null;
};
/* ------------------------------ get interval ------------------------------ */
const getInterval = (time) => {
  const { number, letter } = timeSplit(time);
  switch (letter.toLowerCase()) {
    case 'h':
      if (number == 1) return '1m';
      if (number <= 3) return '3m';
      if (number <= 6) return '5m';
      if (number <= 12) return '15m';
      break;
    case 'd':
      if (number == 1) return '1h';
      if (number == 2) return '2h';
      if (number <= 4) return '4h';
      if (number <= 6) return '6h';
      if (number <= 8) return '8h';
      if (number <= 15) return '12h';
      break;
    case 'w':
      if (number == 1) return '8h';
      if (number == 2) return '12h';
      break;
  }
};
const chartGenagator = async (data, title) => {
  const chart = new QuickChart();
  chart.setWidth(700);
  chart.setHeight(500);
  chart.setVersion('3');
  chart.setDevicePixelRatio(2); // 1 is default and 2 is retina display

  chart.setConfig({
    type: 'candlestick',
    data: {
      datasets: [
        {
          data,
          backgroundColor:["#FF0000", "#008000"]
        },
      ],
    },
    options: {
      scales: {
        x: {
          adapters: {
            date: {
              zone: 'UTC+7',
            },
          },
          type: 'time',
          time: {
            parser: 'MM/DD/YYYY HH:mm:ss',
            // unit: 'minute',
            stepSize: 2,
            displayFormats: {
              minute: 'HH:mm',
            },
          },
          ticks: {
            autoSkip: false,
            minRotation: 45,
            maxRotation: 90,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          fontSize: 20,
          text: title,
        },
      },
    },
  });
  const image = await chart.toBinary();
  return image;
};

/**
 * Retrieves data from the Binance API for a given crypto and time period.
 * @param {string} [crypto='BTC'] - The cryptocurrency symbol (default: 'BTC').
 * @param {string} [period='1w'] - The time period (default: '1w').
 * @returns {Promise<Array>} An array of objects containing data for each candlestick.
 */
const getData = async (crypto = 'BTC', period = '1w') => {
  try {
    // Split the time period into number and letter components.
    const time = timeSplit(period);
    const params = {
      symbol: `${crypto.toUpperCase()}USDT`, // The cryptocurrency symbol.
      interval: getInterval(period), // The time interval.
      startTime: Date.now() - time.number * timeDefine[time.letter], // The start time of the data.
      endTime: Date.now(), // The end time of the data.
    };
    // Send the API request and get the response data.
    const { data } = await axios.get('https://api.binance.com/api/v1/klines', {
      params,
    });

    // Map the response data to a more usable format.
    return data.map(([openTime, open, high, low, close]) => ({
      x: openTime, // The timestamp of the candlestick.
      o: Number(open), // The opening price.
      h: Number(high), // The highest price.
      l: Number(low), // The lowest price.
      c: Number(close), // The closing price.
    }));
  } catch (error) {
    // Do nothing if an error occurs.
  }
};

const getPrice = async (crypto = 'BTC') => {
  const link = `https://api.binance.com/api/v3/ticker/price?symbol=${crypto.toUpperCase()}USDT`;
  const { data } = await axios.get(link);
  return data;
};
const getPricePercent = async (crypto = 'BTC') => {
  const link = `https://api.binance.com/api/v3/ticker/24hr?symbol=${crypto.toUpperCase()}USDT`;
  const { data } = await axios.get(link);
  const { lastPrice, priceChangePercent } = data;
  return { lastPrice, priceChangePercent };
}
const priceFormat = (price) => {
  const num = Number(price);
  let formattedPrice = num < 10 ? num.toFixed(6) : num.toFixed(2);
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: formattedPrice.includes('.')
      ? formattedPrice.split('.')[1].length
      : 0,
    maximumFractionDigits: formattedPrice.includes('.')
      ? formattedPrice.split('.')[1].length
      : 0,
  });
  formattedPrice = formatter.format(Number(price));

  return formattedPrice;
};
module.exports = { chartGenagator, getData, getPrice, priceFormat, getPricePercent };
