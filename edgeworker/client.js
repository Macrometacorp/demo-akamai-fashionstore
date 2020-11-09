import { httpRequest } from "http-request";

const URL = "https://mmgdn1.demo.macrometa.io";
const API_KEY =
  "fashionstore_macrometa.io.fashionstore.LxBhnHq7vSBNWLmb9d2pD4tLDwuMgyG6gKCOn6tWEVI1IKFzMswxckeaYtbmHlbp7f59fd";
const FABRIC = "_system";

const client = {
  executeQuery: function (query, bindVars) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/cursor`, {
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        query,
        bindVars,
      }),
    });
  },
};

export default client;
