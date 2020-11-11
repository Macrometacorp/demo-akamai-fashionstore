import React from "react";
import "../../common/styles/gallery.css";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "../../apiCalls";
import CategoryGalleryFashionItem from "./CategoryGalleryFashionItem";
import { FashionItem } from "../bestSellers/BestSellerProductRow";

interface CategoryGalleryTeaserProps {}

interface CategoryGalleryTeaserState {
  isLoading: boolean;
  // ABHISHEK: correct type
  fashionItems: FashionItem[] | any;
}

export class CategoryGalleryTeaser extends React.Component<
  CategoryGalleryTeaserProps,
  CategoryGalleryTeaserState
> {
  constructor(props: CategoryGalleryTeaserProps) {
    super(props);

    this.state = {
      isLoading: true,
      fashionItems: [],
    };
  }

  async componentDidMount() {
    try {
      const fashionItems = await this.listFashionItems();
      this.setState({ fashionItems });
    } catch (e) {
      console.error(e);
    }

    this.setState({ isLoading: false });
  }

  listFashionItems() {
    return API.get("fashionItems", "/fashionItems?category=Women", null);
  }

  render() {
    return this.state.isLoading ? (
      <div className="loader" />
    ) : (
      <div>
        <div className="well-bs no-padding-top col-md-12 no-radius">
          <div className="container-category">
            <h3>
              Women's Fashion{" "}
              <small>
                <LinkContainer to="/category/Women">
                  <a>Browse Women's Fashion</a>
                </LinkContainer>
              </small>
            </h3>
            <div className="row">
              {this.state.fashionItems.slice(0, 4).map((fashionItem: any) => (
                <CategoryGalleryFashionItem fashionItem={fashionItem} key={fashionItem["_key"]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CategoryGalleryTeaser;
