const Bottleneck = require('bottleneck');
const cron = require('node-cron');
const { fetchMainSitemap } = require('./sitemap');
const { prerenderUrl } = require('./prerender');
const { BOTTLENECK_CONFIG, CRON_SCHEDULE } = require('./config');
const { fetchAllOriginsData } = require('./originDataFetcher');

const limiter = new Bottleneck(BOTTLENECK_CONFIG);

let isShuttingDown = false;
let limiterStopped = false;

const startPrerenderTask = async (sitemapUrls, customerID) => {
  for (const sitemapUrl of sitemapUrls) {
    try {
      const urls = await fetchMainSitemap(sitemapUrl);
      let processedUrls = 0;

      for (const url of urls) {
        if (isShuttingDown) {
          console.log('Graceful shutdown in progress. Stopping further tasks.');
          break;
        }

        try {
          limiter
            .schedule(() => prerenderUrl(url, customerID))
            .then((statusCode) => {
              processedUrls++;
              console.log(`Processed URL ${url} with status code: ${statusCode}`);
              if (processedUrls % 10 === 0) {
                console.log(`Processed ${processedUrls} of ${urls.length} URLs.`);
              }
            })
            .catch((error) => {
              console.error(`Error prerendering URL ${url}:`, error);
            });
        } catch (error) {
          console.error(`Error scheduling prerender task for URL ${url}:`, error);
        }
      }
    } catch (error) {
      console.error('Error during prerendering:', error);
    }
  }
};

const handleLimiterStop = async (forceDrop = false) => {
  if (limiterStopped) return;

  limiterStopped = true;
  await limiter.stop({ dropWaitingJobs: forceDrop });
};

// Schedule tasks for each sitemap
let scheduledTasks = [];
console.log('Cron schedule pattern:', CRON_SCHEDULE);

const startAllPrerenderTasksSequentially = async () => {
  const allOriginsData = await fetchAllOriginsData();

  for (const originData of Object.values(allOriginsData)) {
    await startPrerenderTask(originData.sitemaps, originData.customerID);
  }
};

startAllPrerenderTasksSequentially();
const scheduledTask = cron.schedule(CRON_SCHEDULE, startAllPrerenderTasksSequentially);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (isShuttingDown) {
    console.log('Shutdown process is already in progress.');
    return;
  }

  console.log('\nGraceful shutdown initiated.');
  isShuttingDown = true;
  scheduledTasks.forEach((task) => task.stop());

  try {
    await handleLimiterStop();
    console.log('All tasks completed. Exiting now.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Immediate Shutdown
process.on('SIGTERM', async () => {
  console.log('\nImmediate shutdown initiated.');
  scheduledTasks.forEach((task) => task.stop());

  try {
    await handleLimiterStop(true);
    console.log('All tasks stopped. Exiting now.');
    process.exit(0);
  } catch (error) {
    console.error('Error during immediate shutdown:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
