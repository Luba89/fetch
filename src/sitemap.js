const { exec } = require('child_process');
const xml2js = require('xml2js');

const executeShellCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};

const fetchSitemap = async (url) => {
  try {
    const curlCommand = `curl -L "${url}"`; // -L to follow redirects if any
    const response = await executeShellCommand(curlCommand);
    const parsedResult = await xml2js.parseStringPromise(response);

    if (parsedResult.sitemapindex) {
      let allUrls = [];
      for (const sitemap of parsedResult.sitemapindex.sitemap) {
        const sitemapUrls = await fetchSitemap(sitemap.loc[0]);
        allUrls = allUrls.concat(sitemapUrls);
      }
      return allUrls;
    }

    if (parsedResult.urlset) {
      const url = parsedResult.urlset.url.map((urlObject) => urlObject.loc[0]);
      return url;
    }

    console.warn('Unrecognized sitemap format detected.');
    return [];
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    throw error;
  }
};

const fetchMainSitemap = async (sitemapUrl) => {
  return fetchSitemap(sitemapUrl);
};

module.exports = {
  fetchMainSitemap,
};
