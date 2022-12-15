import React from "react"
import "../../common/styles/gallery.css"
import { API } from "../../apiCalls"
import CategoryGalleryFashionItem from "./CategoryGalleryFashionItem"
import { FashionItem } from "../bestSellers/BestSellerProductRow"

interface CategoryGalleryProps {
    match: any
}

interface CategoryGalleryState {
    isLoading: boolean
    fashionItems: FashionItem[]
}

export class CategoryGallery extends React.Component<CategoryGalleryProps, CategoryGalleryState> {
    constructor(props: CategoryGalleryProps) {
        super(props)

        this.state = {
            isLoading: true,
            fashionItems: [],
        }
    }

    async componentDidMount() {
        try {
            const fashionItems = await this.listFashionItems()
            this.setState({ fashionItems })
        } catch (e) {
            console.error(e)
        }

        this.setState({ isLoading: false })
    }

    listFashionItems() {
        return API.get("fashionItems", `/fashionItems?category=${this.props.match.params.id}`, null)
    }

    render() {
        return this.state.isLoading ? (
            <div className="loader" />
        ) : (
            <div>
                <div className="well-bs no-radius">
                    <div className="container-category">
                        <h3>{this.props.match.params.id}</h3>
                        <div className="row">
                            {this.state.fashionItems.map((fashionItem) => (
                                <CategoryGalleryFashionItem fashionItem={fashionItem} key={fashionItem["_key"]} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default CategoryGallery
