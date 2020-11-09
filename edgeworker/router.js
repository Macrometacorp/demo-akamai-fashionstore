import URLSearchParams from "url-search-params";

import {
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
} from "./handler.js";

const pathHandlers = [
  {
    regEx: ".*/api/init",
    handlers: {
      POST: function (request) {
        return initHandler(request);
      },
    },
  },
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
    regEx: ".*/api/fashion*",
    handlers: {
      GET: function (request) {
        return fashionItemHandler(request, "ListFashionItems");
      },
    },
  },
  {
    regEx: ".*/api/fashion/f[0-9]+",
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
        // ABHISHEK: "AddPurchased"
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
    regEx: ".*/api/getImage*",
    handlers: {
      GET: function (request) {
        return getImageHandler(request);
      },
    },
  },
  {
    regEx: ".*/api/search",
    handlers: {
      GET: function (request) {
        return searchHandler(request);
      },
    },
  },
];

const executeHandler = (request) => {
  // /api/signin?method=post&username=abhishek@macrometa.io&password=12345678
  const path = request.path;
  // const method = request.method;

  const params = new URLSearchParams(request.query);
  const method = (params.get("method") || "GET").toUpperCase();

  const handlerObj = pathHandlers.find((pathHandler) => {
    const matched = path.match(pathHandler.regEx) || [];
    return matched[0] === path;
  });

  const handler = handlerObj && handlerObj.handlers[method];

  if (!handlerObj || !handler || typeof handler !== "function") {
    // ABHISHEK: return 404
    return { status: 404, message: `No handler for ${path}?method=${method}` };
  } else {
    return handler(request);
  }
};

export { executeHandler };
