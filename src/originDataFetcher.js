const axios = require("axios");
const {
  CUSTOMER_CONFIG,
  PRERENDER_SERVICE_URL,
  ORIGIN_PATH,
  CUSTOMERID_HEADER,
  ORIGIN_HEADER,
} = require("./config");

const fetchAllOriginsFromAPI = async (customerID, origin) => {
  try {
    const headers = {
      [CUSTOMERID_HEADER]: customerID,
      [ORIGIN_HEADER]: origin,
    };
    const response = await axios.get(
      `${PRERENDER_SERVICE_URL}/${ORIGIN_PATH}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching origins from the API:", error);
    return [];
  }
};

const getSitemapsForCustomerID = async (customer) => {
  const origins = await fetchAllOriginsFromAPI(
    customer.CustomerID,
    customer.origin
  );
  for (let originData of origins.data) {
    if (originData.origin === customer.origin) {
      // Create full URLs for sitemaps
      const fullURLs = originData.siteMaps.map(
        (sitemap) => `${originData.origin}${sitemap}`
      );
      return fullURLs;
    }
  }

  return []; // return empty array if no match is found
};

const fetchAllOriginsData = async () => {
  const originsData = {};

  for (const customer of CUSTOMER_CONFIG) {
    const sitemaps = await getSitemapsForCustomerID(customer);
    originsData[customer.origin] = {
      sitemaps: sitemaps,
      customerID: customer.CustomerID,
    };
  }
  return originsData;
};

module.exports = {
  fetchAllOriginsData,
};
