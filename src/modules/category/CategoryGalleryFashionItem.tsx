import React from "react";
import "../../common/styles/gallery.css";
import StarRating from "../../common/starRating/StarRating";
import AddToCart from "../../common/AddToCart";
import { FashionItem } from "../bestSellers/BestSellerProductRow";

interface CategoryGalleryFashionItemProps {
  fashionItem: FashionItem;
}

export class CategoryGalleryFashionItem extends React.Component<
  CategoryGalleryFashionItemProps
> {
  render() {
    if (!this.props.fashionItem) return;
    return (
      <div className="col-sm-3 col-md-3">
        <div className="thumbnail no-border">
          <p className="rating-container">
            <StarRating stars={this.props.fashionItem.rating} />
            <span className="pull-right">{`$${this.props.fashionItem.price}`}</span>
          </p>
          <img
            style={{ height: "200px", width: "150px" }}
            src={`../../images/categories/${this.props.fashionItem["_key"]}.jpg`}
            alt={`${this.props.fashionItem.name} cover`}
          />
          <div className="caption">
            <h4 className="text-center">{this.props.fashionItem.name}</h4>
            <AddToCart
              fashionItemId={this.props.fashionItem["_key"]}
              price={this.props.fashionItem.price}
              variant="center"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryGalleryFashionItem;
