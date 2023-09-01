const axios = require("axios");
const {
  PRERENDER_SERVICE_URL,
  ORIGIN_QUERY,
  CUSTOMERID_HEADER,
  ORIGIN_HEADER,
  PRERENDER_PATH,
  PATH_QUERY,
} = require("./config");

const prerenderUrl = async (url, customerID) => {

  const { hostname: host, pathname: path } = new URL(url);

  const urlForPrerendering = `${PRERENDER_SERVICE_URL}/${PRERENDER_PATH}?${ORIGIN_QUERY}=${host}&${PATH_QUERY}=${path}`;
  try {
    const headers = {
      [CUSTOMERID_HEADER]: customerID,
      [ORIGIN_HEADER]: host,
    };
    const response = await axios.get(urlForPrerendering, { headers });
    return response.status;
  } catch (error) {
    if (error.response) {
      console.error("Error while prerendering:", error);
      return error.response.status;
    } else {
      console.error("Error while prerendering:", error);
      throw error;
    }
  }
};

module.exports = {
  prerenderUrl,
};
