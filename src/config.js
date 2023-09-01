require('dotenv').config();

const PRERENDER_SERVICE_URL = process.env.PRERENDER_SERVICE_URL;
const ORIGIN_QUERY = process.env.ORIGIN_QUERY; // Query parameter for the host
const PATH_QUERY = process.env.PATH_QUERY; // Query parameter for the path
const ORIGIN_PATH = process.env.ORIGIN_PATH;
const PRERENDER_PATH = process.env.PRERENDER_PATH;
const CUSTOMERID_HEADER = process.env.CUSTOMERID_HEADER;
const ORIGIN_HEADER = process.env.ORIGIN_HEADER;

const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 5;

const CUSTOMER_CONFIG = JSON.parse(process.env.CUSTOMER_CONFIG || '[]');

const CRON_SCHEDULE = process.env.CRON_SCHEDULE;
const BOTTLENECK_CONFIG = {
  reservoir: RATE_LIMIT,
  reservoirRefreshAmount: RATE_LIMIT,
  reservoirRefreshInterval: 1000,
  maxConcurrent: RATE_LIMIT,
  minTime: 1000 / RATE_LIMIT,
};

module.exports = {
  RATE_LIMIT,
  CUSTOMER_CONFIG,
  BOTTLENECK_CONFIG,
  CRON_SCHEDULE,
  PRERENDER_SERVICE_URL,
  ORIGIN_QUERY,
  PATH_QUERY,
  ORIGIN_PATH,
  PRERENDER_PATH,
  CUSTOMERID_HEADER,
  ORIGIN_HEADER,
};
