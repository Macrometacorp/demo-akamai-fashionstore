import React from "react"
import "../../common/styles/productRow.css"
import StarRating from "../../common/starRating/StarRating"
import { API } from "../../apiCalls"
import AddToCart from "../../common/AddToCart"
import FriendRecommendations from "../../common/friendRecommendations/FriendRecommendations"
import { FashionItem } from "../bestSellers/BestSellerProductRow"

interface ProductRowProps {
    fashionItem: FashionItem
    fashionItemId: string
}

interface ProductRowState {
    fashionItem: FashionItem | undefined
}

export class ProductRow extends React.Component<ProductRowProps, ProductRowState> {
    constructor(props: ProductRowProps) {
        super(props)

        this.state = {
            fashionItem: undefined,
        }
    }

    componentDidMount() {
        this.setState({ fashionItem: this.props.fashionItem })
        // API.get("fashionItems", `/fashionItems/${this.props.fashionItemId}`, null)
        //   .then((response) => this.setState({ fashionItem: response }))
        //   .catch((error) => console.error(error));
    }

    render() {
        if (!this.state.fashionItem) return null

        return (
            <div className="white-box">
                <div className="media">
                    <div className="media-left media-middle no-padding">
                        <img
                            className="product-thumb border"
                            src={`${process.env.PUBLIC_URL}/categories/${this.state.fashionItem["_key"]}.jpg`}
                            alt={`${this.state.fashionItem.name} cover`}
                        />
                    </div>
                    <div className="media-body product-padding padding-20">
                        <h3 className="media-heading">
                            {this.state.fashionItem.name}
                            <small className="pull-right ">${this.state.fashionItem.price}</small>
                        </h3>
                        <p className="no-margin">
                            <small>{this.state.fashionItem.category}</small>
                        </p>
                        <FriendRecommendations fashionItemId={this.props.fashionItemId} />
                        <div>
                            Rating
                            <AddToCart
                                fashionItemId={this.state.fashionItem["_key"]}
                                price={this.state.fashionItem.price}
                            />
                        </div>
                        <StarRating stars={this.state.fashionItem.rating} />
                    </div>
                </div>
            </div>
        )
    }
}

export default ProductRow
