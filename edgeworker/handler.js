import URLSearchParams from "url-search-params";

import client from "./client.js";
import queries from "./c8qls.js";

const CUSTOMER_ID_HEADER = "x-customer-id";

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
    status: 401,
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

async function initHandler(request) {
  let res;

  try {
    await init(client);
    res = { status: "200", message: "Init successful" };
  } catch (e) {
    res = e;
  } finally {
    // ABHISHEK
    // return new Response(JSON.stringify(res), optionsObj);
  }
}

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
      // ABHISHEK: see for other then GET
      // const fashionItemId = getQueryParam(request, "fashionItemId");
      // const quantity = getQueryParam(request, "quantity");
      // const price = getQueryParam(request, "price");
      // requestBody = {
      //   fashionItemId,
      // };
      // if (c8qlKey === "AddToCart") {
      //   requestBody = {
      //     ...requestBody,
      //     quantity,
      //     price,
      //   };
      // } else if (c8qlKey === "UpdateCart") {
      //   requestBody = { ...requestBody, quantity };
      // }
      // bindValue = { ...bindValue, ...requestBody };
    }
    return executeQuery(c8qlKey, bindValue);

    // const fashionItemId = getQueryParam(request, "fashionItemId");
    // const quantity = getQueryParam(request, "quantity");
    // const price = getQueryParam(request, "price");

    // return Promise.resolve({
    //   error: false,
    //   status: 401,
    //   message: { fashionItemId, quantity, price },
    // });
  }
  return notLoggedIn();
}

async function ordersHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  let body = { error: true, status: 400, message: "Customer Id not provided" };
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
    return await executeQuery(c8qlKey, bindValue);
    // if (shouldUpdatePurchased && !body.error) {
    //   await executeQuery("AddPurchased", { orderId });
    // }
  }
  return notLoggedIn();
}

async function bestSellersHandler(request, c8qlKey) {
  return executeQuery(c8qlKey);
}

async function recommendationsHandler(request, c8qlKey) {
  const customerId = getCustomerId(request);
  let body = { error: true, status: 400, message: "Customer Id not provided" };
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
  const { username, password } = await request.json();

  const encodedPassword = new TextEncoder().encode(password);

  const digestedPassword = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    encodedPassword // The data you want to hash as an ArrayBuffer
  );
  const passwordHash = new TextDecoder("utf-8").decode(digestedPassword);
  const customerId = uuid();
  const result = await executeQuery("signup", {
    username,
    passwordHash,
    customerId,
  });
  if (!result.error) {
    const res = await executeQuery("AddFriends", { username });
  }

  const body = JSON.stringify(result);
  // return new Response(body, optionsObj);
}

async function signinHandler(request) {
  const { username, password } = await request.json();
  const encodedPassword = new TextEncoder().encode(password);
  const digestedPassword = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    encodedPassword // The data you want to hash as an ArrayBuffer
  );
  const passwordHash = new TextDecoder("utf-8").decode(digestedPassword);
  const result = await executeQuery("signin", {
    username,
    passwordHash,
  });
  let message = "User not found";
  let status = 404;
  if (result.length) {
    message = result;
    status = 200;
  }
  const body = JSON.stringify({ message });
  // return new Response(body, { status, ...optionsObj });
}

function whoAmIHandler(request) {
  const customerId = getCustomerId(request);
  let message = "No current user";
  let status = 401;
  if (customerId !== "null" && customerId) {
    message = customerId;
    status = 200;
  }
  return Promise.resolve({ error: true, status, message });
}

async function getImageHandler(request) {
  // const queryParam = getLastPathParam(request);
  // const fashionItemId = queryParam.split("?")[1].split("=")[1];
  const fashionItemId = getQueryParam(request, "fashionItemId");
  const res = await client.getValueForKey("ImagesKVTable", fashionItemId);
  const base64Img = res.value;
  // const response = new Response(decode(base64Img), {
  //   headers: { "Content-Type": "image/jpeg" },
  // });

  // const res = await BOOK_IMAGES.get(fashionItemId, "arrayBuffer");
  // const response = new Response(res, {
  //   headers: { "Content-Type": "image/jpeg" },
  // });

  // return response;
}

export {
  initHandler,
  fashionItemHandler,
  cartHandler,
  ordersHandler,
  bestSellersHandler,
  recommendationsHandler,
  searchHandler,
  signupHandler,
  signinHandler,
  whoAmIHandler,
  getImageHandler,
};
