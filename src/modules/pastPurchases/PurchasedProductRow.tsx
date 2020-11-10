import React from "react";
import "../../common/styles/productRow.css";
import StarRating from "../../common/starRating/StarRating";
import { API } from "../../apiCalls";
import AddToCart from "../../common/AddToCart";
import FriendRecommendations from "../../common/friendRecommendations/FriendRecommendations";
import { FashionItem } from "../bestSellers/BestSellerProductRow";
import { Order } from "../cart/CartProductRow";

interface PurchasedProductRowProps {
  order: Order;
}

interface PurchasedProductRowState {
  fashionItem: any;
}

export class PurchasedProductRow extends React.Component<
  PurchasedProductRowProps,
  PurchasedProductRowState
> {
  constructor(props: PurchasedProductRowProps) {
    super(props);

    this.state = {
      fashionItem: undefined,
    };
  }

  async componentDidMount() {
    try {
      // const fashionItem = await this.getFashionItem(this.props.order);
      this.setState({ fashionItem: this.props.order });
    } catch (e) {
      console.error(e);
    }
  }

  // getFashionItem(order: Order) {
  //   return API.get("fashionItems", `/fashionItems/${order.fashionItemId}`, null);
  // }

  render() {
    if (!this.state.fashionItem) {
      return (
        <div className="white-box">
          <div className="media">
            <div className="media-left media-middle">
              <div className="loader-no-margin" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="white-box">
        <div className="media">
          <div className="media-left media-middle">
            <img
              className="media-object product-thumb"
              src={`../../images/categories/${this.state.fashionItem.fashionItemId}.jpg`}
              alt={`${this.state.fashionItem.name} covers`}
            />
          </div>
          <div className="media-body">
            <h3 className="media-heading">
              {this.state.fashionItem.name}
              <div className="pull-right margin-1">
                <small>{`${this.props.order.quantity} @ ${this.state.fashionItem.price}`}</small>
              </div>
            </h3>
            <small>{this.state.fashionItem.category}</small>
            {/* <FriendRecommendations fashionItemId={this.props.order.fashionItemId} /> */}
            <div>
              Rating
              <AddToCart
                fashionItemId={this.state.fashionItem.fashionItemId}
                price={this.state.fashionItem.price}
                variant="buyAgain"
              />
            </div>
            <StarRating stars={this.state.fashionItem.rating} />
          </div>
        </div>
      </div>
    );
  }
}

export default PurchasedProductRow;
