import React from "react"
import "../../common/styles/gallery.css"
import { API } from "../../apiCalls"
import CategoryGalleryFashionItem from "../category/CategoryGalleryFashionItem"
import { FashionItem } from "../bestSellers/BestSellerProductRow"

interface SearchGalleryProps {
    match: any
}

interface SearchGalleryState {
    isLoading: boolean
    fashionItems: FashionItem[]
}

export class SearchGallery extends React.Component<SearchGalleryProps, SearchGalleryState> {
    constructor(props: SearchGalleryProps) {
        super(props)

        this.state = {
            isLoading: true,
            fashionItems: [],
        }
    }

    async componentDidMount() {
        try {
            const searchResults = await this.searchFashionItems()

            // Map the search results to a fashionItem object
            // const fashionItems = [];
            // for (var i = 0; i < searchResults.hits.total; i++) {
            //   var hit = searchResults.hits.hits[i] && searchResults.hits.hits[i]._source;
            //   hit && fashionItems.push({
            //     _key: hit.id.$,
            //     author: hit.author.S,
            //     category: hit.category.S,
            //     // id: hit.id.S,
            //     name: hit.name.S,
            //     price: hit.price.N,
            //     rating: hit.rating.N,
            //   });
            // }

            this.setState({
                fashionItems: searchResults,
            })
        } catch (e) {
            console.error(e)
        }

        this.setState({ isLoading: false })
    }

    searchFashionItems() {
        return API.get("search", `/search?q=${this.props.match.params.id}`, null)
    }

    render() {
        return this.state.isLoading ? (
            <div className="loader" />
        ) : (
            <div>
                <div className="well-bs no-radius">
                    <div className="container-category">
                        <h3>Search results</h3>
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

export default SearchGallery
