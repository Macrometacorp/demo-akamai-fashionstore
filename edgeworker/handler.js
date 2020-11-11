import URLSearchParams from "url-search-params";

import { sha256 } from "js-sha256";

import client from "./client.js";
import queries from "./c8qls.js";

const CUSTOMER_ID_HEADER = "x-customer-id";

const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getLastPathParam = (request) => {
  const path = request.path;
  const splitUrl = path.split("/");
  return splitUrl[splitUrl.length - 1];
};

const getQueryParam = (request, key) => {
  const params = new URLSearchParams(request.query);
  return params.get(key);
};

const notLoggedIn = () =>
  Promise.resolve({
    error: true,
    code: 401,
    message: "No current user",
  });

const executeQuery = async (c8qlKey, bindValue) => {
  const { query, bindVars } = queries(c8qlKey, bindValue);
  return client.executeQuery(query, bindVars);
};

const getCustomerId = (request) => {
  let header = request.getHeader(CUSTOMER_ID_HEADER);
  if (!header) {
    header = null;
  } else if (Array.isArray(header)) {
    header = header[0];
  }
  return header;
};

async function fashionItemHandler(request, c8qlKey) {
  let bindValue = getLastPathParam(request);
  const categoryQueryParam = getQueryParam(request, "category");
  if (
    c8qlKey === "ListFashionItems" &&
    categoryQueryParam !== "null" &&
    categoryQueryParam
  ) {
    bindValue = { category: categoryQueryParam };
  }
  return executeQuery(c8qlKey, bindValue);
}

async function cartHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  if (customerId) {
    let bindValue = { customerId };
    let requestBody;

    if (c8qlKey === "ListItemsInCart") {
      // do nothing
    } else if (c8qlKey === "GetCartItem") {
      bindValue = { ...bindValue, fashionItemId: getLastPathParam(request) };
    } else {
      const fashionItemId = getQueryParam(request, "fashionItemId");
      const quantity = parseInt(getQueryParam(request, "quantity"));
      const price = parseFloat(getQueryParam(request, "price"));
      requestBody = {
        fashionItemId,
      };
      if (c8qlKey === "AddToCart") {
        requestBody = {
          ...requestBody,
          quantity,
          price,
        };
      } else if (c8qlKey === "UpdateCart") {
        requestBody = { ...requestBody, quantity };
      }
      bindValue = { ...bindValue, ...requestBody };
    }
    return executeQuery(c8qlKey, bindValue);
  }
  return notLoggedIn();
}

async function ordersHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  if (customerId) {
    let bindValue = { customerId };
    let orderDate = Date.now();
    const orderId = `${orderDate.toString()}:${customerId}`;
    let shouldUpdatePurchased = false;
    if (c8qlKey === "Checkout") {
      bindValue = {
        ...bindValue,
        orderId,
        orderDate,
      };
      shouldUpdatePurchased = true;
    }
    const checkoutPromise = executeQuery(c8qlKey, bindValue);
    if (shouldUpdatePurchased) {
      return checkoutPromise.then(() =>
        executeQuery("AddPurchased", { orderId })
      );
    } else {
      return checkoutPromise;
    }
  }
  return notLoggedIn();
}

async function bestSellersHandler(request, c8qlKey) {
  return executeQuery(c8qlKey);
}

async function recommendationsHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  if (customerId) {
    let bindValue = { customerId };
    if (c8qlKey === "GetRecommendationsByFashionItem") {
      const fashionItemId = getLastPathParam(request);
      bindValue = { ...bindValue, fashionItemId };
    }
    return executeQuery(c8qlKey, bindValue);
  }
  return notLoggedIn();
}

async function searchHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  if (customerId) {
    const search = getQueryParam(request, "q");
    return executeQuery(c8qlKey, { search });
  }
  return notLoggedIn();
}

async function signupHandler(request) {
  const username = getQueryParam(request, "username");
  const password = getQueryParam(request, "password");
  const digestedPassword = sha256(password);

  const customerId = uuidv4();
  return executeQuery("signup", {
    username,
    passwordHash: digestedPassword,
    customerId,
  }).then(() => executeQuery("AddFriends", { username }));
}

async function signinHandler(request) {
  const username = getQueryParam(request, "username");
  const password = getQueryParam(request, "password");

  const passwordHash = sha256(password);

  return executeQuery("signin", {
    username,
    passwordHash,
  })
    .then((res) => res.json())
    .then((data) => {
      const result = data.result;
      let response = {
        error: true,
        code: 404,
        message: "User not found",
      };
      if (result.length) {
        response = {
          error: false,
          code: 200,
          message: result,
        };
      }
      return Promise.resolve(response);
    });
}

function whoAmIHandler(request) {
  const customerId = getCustomerId(request);
  let message = "No current user";
  let code = 401;
  if (customerId !== "null" && customerId) {
    message = customerId;
    code = 200;
  }
  return Promise.resolve({ error: true, code, message });
}

export {
  fashionItemHandler,
  cartHandler,
  ordersHandler,
  bestSellersHandler,
  recommendationsHandler,
  searchHandler,
  signupHandler,
  signinHandler,
  whoAmIHandler,
};
