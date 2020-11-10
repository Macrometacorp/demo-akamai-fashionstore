import { httpRequest } from "http-request";

const URL = "https://vikas.eng.macrometa.io";
const API_KEY = "fashionStore.G1dWFG3CJjutIMptrALrfc3XKXJKKJAE2PlR83uYoki4odiVziD9cJOplIOkA2LT4bd2f9";
const FABRIC = "_system";

const client = {
  executeQuery: function (query, bindVars) {
    return fetch(`${URL}/_fabric/${FABRIC}/_api/cursor`, {
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
