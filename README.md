# Macrometa Akamai e-commerce At the Edge demonstrator app

# Play with a live demo 👇

http://fashionstore.demo.macrometa.io/

![Fasion store sample image](./ecommerce.png)

Macrometa-Akamai Fashionstore Demo App is a full-stack e-commerce web application that creates a storefront (and backend) for customers to shop for "fictitious" fashion clothing & accessories called Edge & M. Originally based on the AWS bookstore template app (https://github.com/aws-samples/aws-bookstore-demo-app), this demo replaces all AWS services like DynamoDB, Neptune, elastic search, lambda etc with Macrometa's geo distributed data platform which provides a K/V store, DynamoDB compatible document database, graph database, streams and event processing along with Akamai workers for the globally distributed functions as a service.

Unlike typical cloud platforms like AWS where the backend stack runs in a single region, Macrometa and Akamai let you build stateful distributed microservices that run in 100s of regions around the world concurrently. The application logic runs in akamai's low latency function as a service runtime on akamai PoPs and make stateful data requests to the closest Macrometa region. End to end latency for P90 is < 55ms from almost everywhere in the world.

As a user of the demo- You can browse and search for fashion clothing & accessories, look at recommendations and best sellers, manage your cart, checkout, view your orders, and more.

## Setup

| **Federation**                                        | **Email**                 | **Passsword** |
| ----------------------------------------------------- | ------------------------- | ------------- |
| [Global Data Network](https://gdn.paas.macrometa.io/) | fashionstore@macrometa.io | `xxxxxxxx`    |

## Overview

### Macrometa components

#### 1. Product catalog/shopping cart - implemented using Macrometa document database

```
FashionItemsTable - collection of the available fashion clothing & accessories.
CartTable - Fashion items customers have addded in their cart
OrdersTable - Past orders of a customer
```

#### 2. Search - implemented using Macrometa Views

```
findFashionItems - the view which is queried for search
```

Search matches on the `category` or the `name` of fashion item in `FashionItemsTable` with phrase matching

#### 3. Recommendations - implemented using Macrometa graphs

```
friend - edge collection
purchased - edge collection
UsersTable - vertex collection
FashionItemsTable vertex collection
UserSocialGraph - Graph
```

#### 4. Top sellers list - implemented using Macrometa Streams & Event Processing

```
UpdateBestseller - Stream app
BestsellersTable - document collection
```

## Database Indexes for different collections

Create persistent indexes on the collection for the corresponding attributes

| **Collection**    | **Attribute**                               |
| ----------------- | ------------------------------------------- |
| BestsellersTable  | `quantity`                                  |
| CartTable         | single index on `customerId, fashionItemId` |
| FashionItemsTable | `category`                                  |
| friend            | N/A                                         |
| OrdersTable       | `customerId`                                |
| UsersTable        | `customerId`                                |

### Akamai components

#### 1. CDN - Akamai CDN to cache static assets

#### 2. Workers - Backend talking with GDN

## Architecture

### Summary diagram

![Fashionstore Arch](./fashionstore_summary_diagram.png)

### High-level, end-to-end diagram

![Fashionstore End to End](./fashionstore_end_to_end.png)

### Frontend

Frontend is a Reactjs application which is hosted on an external server (Nodejs in our case. You can use something else too.) deployed in a Linode machine.

This acts as an Origin server for Akamai CDN and needs to be configured as such as an Akamai property.

### Backend

The core of backend infrastructure consists of Macrometa document store(DB), Macrometa Edge store(DB), Macrometa Views(search), Macrometa Stream Workers, Macrometa Graphs and Akamai Edge workers. Edge workers issue C8QLs to talk with the GDN network.

The application leverages Amazon document store to store all the data for fashion items, orders, the checkout cart and users. When new purchases or new users are added the corresponding Macrometa Edge collection is also updated. These Edge collections along with Document collection acting as vertices are used by the Macrometa Graphs to generate recommendations for the users. When new purchases are added Macrometa Stream Workers also update the BestSellers Collection store in realtime from which the best sellers leaderboard is generated.

![Fashionstore Backend](./fashionstore_backend.png)

## API Details

Below are the list of APIs being used.

> Note: As of writing this Edge Worker's `ResponseProvider` doesn't support `PUT, POST, DELETE, etc`. To work around this limitation these types of calls are converted to query params by the frontend and then sent over. Once in `ResponseProvider` we can make calls to GDN normally.

**Fashion items (Macrometa Docuemnt Store DB)**

GET /fashionItems (ListFashionItems)  
GET /fashionItems/{:id} (GetFashionItem)

**Cart (Macrometa Docuemnt Store DB)**

GET /cart (ListItemsInCart)  
POST /cart (AddToCart)  
PUT /cart (UpdateCart)  
DELETE /cart (RemoveFromCart)  
GET /cart/{:fashionItemId} (GetCartItem)

**Orders (Macrometa Docuemnt Store DB)**

GET /orders (ListOrders)  
POST /orders (Checkout)

**Best Sellers (Macrometa Docuemnt Store DB)**

GET /bestsellers (GetBestSellers)

**Recommendations (Macrometa Graphs)**

GET /recommendations (GetRecommendations)  
GET /recommendations/{fashionItemId} (GetRecommendationsByFashionItem)

**Search (Macrometa Views)**

GET /search (Search)

&nbsp;

### C8QLs

C8QLs are used by the Akamai workers in `ResponseProvider` to communicate with Macrometa GDN.

**signup**

```js
INSERT {_key: @username, password: @passwordHash, customerId: @customerId} INTO UsersTable
```

**AddFriends**

```js
LET otherUsers = (FOR users in UsersTable FILTER users._key != @username RETURN users) FOR user in otherUsers INSERT { _from: CONCAT("UsersTable/",@username), _to: CONCAT("UsersTable/",user._key) } INTO friend
```

**signin**

```js
FOR user in UsersTable FILTER user._key == @username AND user.password == @passwordHash RETURN user.customerId
```

**ListFashionItems**

```js
FOR fashionItem IN FashionItemsTable RETURN fashionItem
```

OR

```js
FOR fashionItem IN FashionItemsTable filter fashionItem.category == @category RETURN fashionItem
```

**GetFashionItem**

```js
FOR fashionItem in FashionItemsTable FILTER fashionItem._key == @fashionItemId RETURN fashionItem
```

**ListItemsInCart**

```js
FOR item IN CartTable FILTER item.customerId == @customerId
    FOR fashionItem in FashionItemsTable FILTER fashionItem._key == item.fashionItemId RETURN {order: item, fashionItem: fashionItem}
```

**AddToCart**

```js
UPSERT { _key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId) }
INSERT { _key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId),customerId: @customerId, fashionItemId: @fashionItemId, quantity: @quantity, price: @price }
UPDATE { quantity: OLD.quantity + @quantity } IN CartTable
```

**UpdateCart**

```js
UPDATE {_key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId),quantity: @quantity} IN CartTable
```

**RemoveFromCart**

```js
REMOVE {_key: CONCAT_SEPARATOR(":", @customerId, @fashionItemId)} IN CartTable
```

**GetCartItem**

```js
FOR item IN CartTable FILTER item.customerId == @customerId AND item.fashionItemId == @fashionItemId RETURN item
```

**ListOrders**

```js
FOR item IN OrdersTable FILTER item.customerId == @customerId RETURN item",
bindValue
```

**Checkout**

```js
LET fashionItems = (
FOR item IN CartTable
    FILTER item.customerId == @customerId
    REMOVE item IN CartTable
    FOR fashionItem in FashionItemsTable
        FILTER fashionItem._key == OLD.fashionItemId
        RETURN {fashionItemId:fashionItem._key,category:fashionItem.category,name:fashionItem.name,price:fashionItem.price,rating:fashionItem.rating,quantity:OLD.quantity}
)
INSERT {_key: @orderId, customerId: @customerId, fashionItems: fashionItems, orderDate: @orderDate} INTO OrdersTable
```

**AddPurchased**

```js
LET order = first(FOR order in OrdersTable FILTER order._key == @orderId RETURN {customerId: order.customerId, fashionItems: order.fashionItems})
LET customerId = order.customerId
LET userId = first(FOR user IN UsersTable FILTER user.customerId == customerId RETURN user._id)
LET fashionItems = order.fashionItems
FOR fashionItem IN fashionItems
    INSERT {_from: userId, _to: CONCAT("FashionItemsTable/",fashionItem.fashionItemId)} INTO purchased
```

**GetBestSellers**

```js
FOR bestseller in BestsellersTable
        SORT bestseller.quantity DESC
        FOR fashionItem in FashionItemsTable
            FILTER bestseller._key == fashionItem._key LIMIT 20 RETURN fashionItem
```

**GetRecommendations**

```js
LET userId = first(FOR user in UsersTable FILTER user.customerId == @customerId return user._id) FOR user IN ANY userId friend FOR fashionItems IN OUTBOUND user purchased RETURN DISTINCT fashionItems
```

**GetRecommendationsByFashionItem**

```js
LET userId = first(FOR user in UsersTable FILTER user.customerId == @customerId return user._id) LET fashionItemId = CONCAT("FashionItemsTable/",@fashionItemId) FOR friendsPurchased IN INBOUND fashionItemId purchased FOR user IN ANY userId friend FILTER user._key == friendsPurchased._key RETURN user._key
```

**Search**

```js
FOR doc IN findFashionItems
SEARCH PHRASE(doc.name, @search, "text_en") OR PHRASE(doc.category, @search, "text_en")
SORT BM25(doc) desc
RETURN doc
```

### Macrometa Views

Search functionality is powered by Macrometa Views. This is saved as `findFashionItems` with below config:

```json
{
  "links": {
    "FashionItemsTable": {
      "analyzers": ["text_en"],
      "fields": {},
      "includeAllFields": true,
      "storeValues": "none",
      "trackListPositions": false
    }
  },
  "primarySort": []
}
```

Stream Worker
Best seller leader board made with `BestsellersTable` which is updated with each new purchase via the `UpdateBestseller` stream worker

```js
@App:name("UpdateBestseller")
@App:description("Updates BestsellerTable when a new order comes in the OrdersTable")

define function getFashionItemQuantity[javascript] return int {
    const prevQuantity = arguments[0];
    const nextQuantity = arguments[1];

    let newQuantity = nextQuantity;
    if(prevQuantity){
        newQuantity = prevQuantity + nextQuantity;
    }
    return newQuantity;
};

@source(type='c8db', collection='OrdersTable', @map(type='passThrough'))
define stream OrdersTable (_json string);

@sink(type='c8streams', stream='BestsellerIntermediateStream', @map(type='json'))
define stream BestsellerIntermediateStream (fashionItemId string, quantity int);

@store(type = 'c8db', collection='BestsellersTable')
define table BestsellersTable (_key string, quantity int);

select json:getString(jsonElement, '$.fashionItemId') as fashionItemId, json:getInt(jsonElement, '$.quantity') as quantity
from OrdersTable#json:tokenizeAsObject(_json, "$.fashionItems[*]")
insert into BestsellerIntermediateStream;

select next.fashionItemId as _key, getFashionItemQuantity(prev.quantity, next.quantity) as quantity
from BestsellerIntermediateStream as next
left outer join BestsellersTable as prev
on next.fashionItemId == prev._key
update or insert into BestsellersTable
set BestsellersTable.quantity = quantity, BestsellersTable._key = _key
on BestsellersTable._key == _key;
```

# Starting with development
## Initialising GDN with init data

Once you have deployed the edgeworker successfully, you will need to initialize some init data. There is a simple node script in `init-script` folder contained in the `edgeworker` folder. Execute the node script by running `npm i && node init.js`.

> Note: Remember to supply correct values to the variables `C8_URL`, `C8_API_KEY` and `DC_LIST` in `init.js`.

1. Now login to the tenant and activate the stream app.
2. Edit and save the VIEW with the correct data if not initialised properly. Details can be found in init.js

## Deploying edgeworker

> Note: Remember to supply correct value to the variable `C8_API_KEY` in `client.js`.

The edgeworker code is contained in the `edgeworker` folder.
Execute `npm i && npm run build`. This will create a `dist` folder with `fashionstore.tgz` in it. Upload this file to the Akamai control center in the `Edgeworker` section.

A simple hello world example can be found [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgeworkers-getting-started-guide/GUID-F8628BC2-8F3A-4E42-B215-DD650ACFF292.html).

## Working on the edgeworker locally

To develop the edgeworker code locally you will need `akamai sndbox` on your development machine. For that you will need to have `Akamai CLI` and `Akamai Edgeworker CLI` installed first.
More info can be found [here](https://developer.akamai.com/cli).

## Working with the UI

The UI code is at the `root` of the repo. Run `npm run buildProd` to generate the UI build with no source maps. Run `npm run build` if you want to have source maps in the UI build.
