import URLSearchParams from "url-search-params";

import {
  fashionItemHandler,
  cartHandler,
  ordersHandler,
  bestSellersHandler,
  recommendationsHandler,
  searchHandler,
  signupHandler,
  signinHandler,
  whoAmIHandler,
} from "./handler.js";

const pathHandlers = [
  {
    regEx: ".*/api/whoami",
    handlers: {
      GET: function (request) {
        return whoAmIHandler(request);
      },
    },
  },
  {
    regEx: ".*/api/signup",
    handlers: {
      POST: function (request) {
        return signupHandler(request);
      },
    },
  },
  {
    regEx: ".*/api/signin",
    handlers: {
      POST: function (request) {
        return signinHandler(request);
      },
    },
  },
  {
    regEx: ".*/api/fashionItems*",
    handlers: {
      GET: function (request) {
        return fashionItemHandler(request, "ListFashionItems");
      },
    },
  },
  {
    regEx: ".*/api/fashionItems/f[0-9]+",
    handlers: {
      GET: function (request) {
        return fashionItemHandler(request, "GetFashionItem");
      },
    },
  },
  {
    regEx: ".*/api/cart",
    handlers: {
      GET: function (request) {
        return cartHandler(request, "ListItemsInCart");
      },
      POST: function (request) {
        return cartHandler(request, "AddToCart");
      },
      PUT: function (request) {
        return cartHandler(request, "UpdateCart");
      },
      DELETE: function (request) {
        return cartHandler(request, "RemoveFromCart");
      },
    },
  },
  {
    regEx: ".*/api/cart/f[0-9]+",
    handlers: {
      GET: function (request) {
        return cartHandler(request, "GetCartItem");
      },
    },
  },
  {
    regEx: ".*/api/orders",
    handlers: {
      GET: function (request) {
        return ordersHandler(request, "ListOrders");
      },
      POST: function (request) {
        return ordersHandler(request, "Checkout");
      },
    },
  },
  {
    regEx: ".*/api/bestsellers",
    handlers: {
      GET: function (request) {
        return bestSellersHandler(request, "GetBestSellers");
      },
    },
  },
  {
    regEx: ".*/api/recommendations",
    handlers: {
      GET: function (request) {
        return recommendationsHandler(request, "GetRecommendations");
      },
    },
  },
  {
    regEx: ".*/api/recommendations/f[0-9]+",
    handlers: {
      GET: function (request) {
        return recommendationsHandler(
          request,
          "GetRecommendationsByFashionItem"
        );
      },
    },
  },
  {
    regEx: ".*/api/search",
    handlers: {
      GET: function (request) {
        return searchHandler(request, "Search");
      },
    },
  },
];

const executeHandler = (request) => {
  // /api/signin?method=post&username=abhishek@macrometa.io&password=12345678
  const path = request.path;

  const params = new URLSearchParams(request.query);
  const method = (params.get("method") || "GET").toUpperCase();

  const handlerObj = pathHandlers.find((pathHandler) => {
    const matched = path.match(pathHandler.regEx) || [];
    return matched[0] === path;
  });

  const handler = handlerObj && handlerObj.handlers[method];

  if (!handlerObj || !handler || typeof handler !== "function") {
    return Promise.resolve({
      error: true,
      code: 404,
      message: `No handler for ${path}?method=${method}`,
    });
  } else {
    return handler(request);
  }
};

export { executeHandler };
