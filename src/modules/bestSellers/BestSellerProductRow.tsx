import React from "react";
import { API } from "../../apiCalls";

import AddToCart from "../../common/AddToCart";
import FriendRecommendations from "../../common/friendRecommendations/FriendRecommendations";
import StarRating from "../../common/starRating/StarRating";
import "../../common/styles/productRow.css";

interface ProductRowProps {
  fashionItemId: string;
  fashionItem: FashionItem;
}

export interface FashionItem {
  _key: string;
  category: string,
  name: string,
  price: number,
  rating: number
}

interface ProductRowState {
  fashionItem: FashionItem | undefined;
}

export class ProductRow extends React.Component<
  ProductRowProps,
  ProductRowState
> {
  constructor(props: ProductRowProps) {
    super(props);

    this.state = {
      fashionItem: undefined,
    };
  }

  async componentDidMount() {
    try {
      // const fashionItem = await this.getFashionItem();
      this.setState({ fashionItem: this.props.fashionItem });
    } catch (e) {
      console.error(e);
    }
  }

  getFashionItem() {
    return API.get("fashionItems", `/fashionItems/${this.props.fashionItemId}`, null);
  }

  render() {
    if (!this.state.fashionItem) return null;

    return (
      <div className="white-box">
        <div className="media">
          <div className="media-left media-middle no-padding">
            <img
              className="media-object product-thumb"
              src={`${process.env.PUBLIC_URL}/categories/${this.state.fashionItem["_key"]}`}
              alt={`${this.state.fashionItem.name} cover`}
            />
          </div>
          <div className="media-body product-padding padding-20">
            <h3 className="media-heading">
              {this.state.fashionItem.name}
              <small className="pull-right margin-1">
                <h4>${this.state.fashionItem.price}</h4>
              </small>
            </h3>
            <p>
              <small>{this.state.fashionItem.category}</small>
            </p>
            {/*ABHISHEK*/}
            {/* <FriendRecommendations fashionItemId={this.props.fashionItemId} /> */}
            <div>
              Rating
              <AddToCart
                fashionItemId={this.props.fashionItemId}
                price={this.state.fashionItem.price}
              />
            </div>
            <StarRating stars={this.state.fashionItem.rating} />
          </div>
        </div>
      </div>
    );
  }
}

export default ProductRow;
