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

  hasCollection: function (name) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/collection/${name}`,{
      method: "GET",
      headers: {
        authorization: `apikey ${API_KEY}`,
      }
    }).then(response => {
      if (response.ok) {
        return response.json()
      } else if(response.status === 404) {
        return Promise.reject('error 404')
      } else {
        return Promise.reject('some other error: ' + response.status)
      }
    })
  },
  
  createCollection: function (name, isEdge) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/collection`,{
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        name: name,
        type: isEdge ? 3 : 2,
      })
    });
  },

  insertDocuments: function(name, data) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/document?collection=${name}`,{
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify(data)
    });
  },

  hasGraph: function (name) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/graph/${name}`,{
      method: "GET",
      headers: {
        authorization: `apikey ${API_KEY}`,
      }
    }).then(response => {
      if (response.ok) {
        return response.json()
      } else if(response.status === 404) {
        return Promise.reject('error 404')
      } else {
        return Promise.reject('some other error: ' + response.status)
      }
    })
  },

  createGraph:  function (name, properties) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/graph`,{
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        ...properties,
        name
      })
    });
  },

  hasView: function (name) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/search/view/${name}`,{
      method: "GET",
      headers: {
        authorization: `apikey ${API_KEY}`,
      }
    }).then(response => {
      if (response.ok) {
        return response.json()
      } else if(response.status === 404) {
        return Promise.reject('error 404')
      } else {
        return Promise.reject('some other error: ' + response.status)
      }
    })
  },

  createView:  function (name, properties) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/search/view`,{
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        ...properties,
        name,
        type: "search"
      })
    });
  },

  hasStreamApp: function (name) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/streamapps/${name}`,{
      method: "GET",
      headers: {
        authorization: `apikey ${API_KEY}`,
      }
    }).then(response => {
      if (response.ok) {
        return response.json()
      } else if(response.status === 404) {
        return Promise.reject('error 404')
      } else {
        return Promise.reject('some other error: ' + response.status)
      }
    })
  },

  createStreamApp:  function (regions, appDefinition) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/streamapps`,{
      method: "POST",
      headers: {
        authorization: `apikey ${API_KEY}`,
      },
      body: JSON.stringify({
        definition: appDefinition,
        regions: regions,
      }),
    });
  },

  activateStreamApplication:  function (name, active) {
    return httpRequest(`${URL}/_fabric/${FABRIC}/_api/streamapps/${name}/active?active=${active}`,{
      method: "PATCH",
      headers: {
        authorization: `apikey ${API_KEY}`,
      }
    });
  },
};

export default client;
