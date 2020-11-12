const queries = (queryName, bindValue) => {
  let queryObj;
  switch (queryName) {
    case "signup":
      queryObj = {
        query: `INSERT {_key: @username, password: @passwordHash, customerId: @customerId} INTO UsersTable`,
        bindVars: bindValue,
      };
      break;
    case "AddFriends":
      queryObj = {
        query: `LET otherUsers = (FOR users in UsersTable FILTER users._key != @username RETURN users)
          FOR user in otherUsers
              INSERT { _from: CONCAT("UsersTable/",@username), _to: CONCAT("UsersTable/",user._key)  } INTO friend`,
        bindVars: bindValue,
      };
      break;
    case "signin":
      queryObj = {
        query: `FOR user in UsersTable FILTER user._key == @username AND user.password == @passwordHash RETURN user.customerId`,
        bindVars: bindValue,
      };
      break;

    case "ListFashionItems":
      queryObj = {
        query: "FOR fashionItem IN FashionItemsTable RETURN fashionItem",
        bindVars: {},
      };
      if (typeof bindValue === "object" && Object.keys(bindValue).length) {
        queryObj = {
          query:
            "FOR fashionItem IN FashionItemsTable filter fashionItem.category == @category RETURN fashionItem",
          bindVars: bindValue,
        };
      }

      break;
    case "GetFashionItem":
      queryObj = {
        query:
          "FOR fashionItem in FashionItemsTable FILTER fashionItem._key == @fashionItemId RETURN fashionItem",
        bindVars: { fashionItemId: bindValue },
      };
      break;

    case "ListItemsInCart":
      queryObj = {
        // query:
        //   "FOR item IN CartTable FILTER item.customerId == @customerId RETURN item",
        query: `FOR item IN CartTable FILTER item.customerId == @customerId
          FOR fashionItem in FashionItemsTable FILTER fashionItem._key == item.fashionItemId
              RETURN {order: item, fashionItem: fashionItem}`,
        bindVars: bindValue,
      };
      break;
    case "AddToCart":
      queryObj = {
        query: `UPSERT { _key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId) } 
            INSERT { _key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId),customerId: @customerId, fashionItemId: @fashionItemId, quantity: @quantity, price: @price } 
            UPDATE { quantity: OLD.quantity + @quantity } IN CartTable`,
        bindVars: bindValue,
      };
      break;
    case "UpdateCart":
      queryObj = {
        query:
          'UPDATE {_key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId),quantity: @quantity} IN CartTable',
        bindVars: bindValue,
      };
      break;
    case "RemoveFromCart":
      queryObj = {
        query:
          'REMOVE {_key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId)} IN CartTable',
        bindVars: bindValue,
      };
      break;
    case "GetCartItem":
      queryObj = {
        query:
          "FOR item IN CartTable FILTER item.customerId == @customerId AND item.fashionItemId == @fashionItemId RETURN item",
        bindVars: bindValue,
      };
      break;

    case "ListOrders":
      queryObj = {
        query:
          "FOR item IN OrdersTable FILTER item.customerId == @customerId RETURN item",
        bindVars: bindValue,
      };
      break;
    case "Checkout":
      queryObj = {
        query: `LET fashionItems = (
          FOR item IN CartTable
              FILTER item.customerId == @customerId
              REMOVE item IN CartTable
              FOR fashionItem in FashionItemsTable
                  FILTER fashionItem._key == OLD.fashionItemId
                  RETURN {fashionItemId:fashionItem._key,category:fashionItem.category,name:fashionItem.name,price:fashionItem.price,rating:fashionItem.rating,quantity:OLD.quantity}
      )
      INSERT {_key: @orderId, customerId: @customerId, fashionItems: fashionItems, orderDate: @orderDate} INTO OrdersTable`,
        bindVars: bindValue,
      };
      break;
    case "AddPurchased":
      queryObj = {
        query: `LET order = first(FOR order in OrdersTable FILTER order._key == @orderId RETURN {customerId: order.customerId, fashionItems: order.fashionItems})
          LET customerId = order.customerId
          LET userId = first(FOR user IN UsersTable FILTER user.customerId == customerId RETURN user._id)
          LET fashionItems = order.fashionItems
          FOR fashionItem IN fashionItems
              INSERT {_from: userId, _to: CONCAT("FashionItemsTable/",fashionItem.fashionItemId)} INTO purchased`,
        bindVars: bindValue,
      };
      break;

    case "GetBestSellers":
      queryObj = {
        // query:
        //   "FOR fashionItem in BestsellersTable SORT fashionItem.quantity DESC LIMIT 20 return fashionItem._key",
        query: `FOR bestseller in BestsellersTable
          FOR fashionItem in FashionItemsTable
              FILTER bestseller._key == fashionItem._key SORT bestseller.quantity DESC LIMIT 20 RETURN fashionItem`,
        bindVars: {},
      };
      break;

    case "GetRecommendations":
      queryObj = {
        query: `LET userId = first(FOR user in UsersTable FILTER user.customerId == @customerId return user._id)
          FOR user IN ANY userId friend
              FOR fashionItems IN OUTBOUND user purchased
              RETURN fashionItems`,
        bindVars: bindValue,
      };
      break;
    case "GetRecommendationsByFashionItem":
      queryObj = {
        query: `LET userId = first(FOR user in UsersTable FILTER user.customerId == @customerId return user._id)
        LET fashionItemId = CONCAT("FashionItemsTable/",@fashionItemId)
        LET recommendedUsers = (FOR friendsPurchased IN INBOUND fashionItemId purchased
            FOR user IN ANY userId friend
                FILTER user._key == friendsPurchased._key
                    RETURN user)
        RETURN LENGTH(recommendedUsers)`,
        bindVars: bindValue,
      };
      break;

    case "Search":
      queryObj = {
        query: `FOR doc IN findFashionItems
        SEARCH PHRASE(doc.name, @search, "text_en") OR PHRASE(doc.category, @search, "text_en")
        SORT BM25(doc) desc
        RETURN doc`,
        bindVars: bindValue,
      };
      break;
  }
  return queryObj;
};

export default queries;
