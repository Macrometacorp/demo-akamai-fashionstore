import React from "react"
import { ProductRow } from "./ProductRow"
import { API } from "../../apiCalls"

interface FriendsBoughtProps {}

interface FriendsBoughtState {
    isLoading: boolean
    recommendations: any[] // FIXME
}

export class FriendsBought extends React.Component<FriendsBoughtProps, FriendsBoughtState> {
    constructor(props: FriendsBoughtProps) {
        super(props)

        this.state = {
            isLoading: true,
            recommendations: [],
        }
    }

    componentDidMount() {
        API.get("recommendations", "/recommendations", null)
            .then((response) => {
                this.setState({
                    recommendations: response,
                    isLoading: false,
                })
            })
            .catch((error) => console.error(error))
    }

    render() {
        if (this.state.isLoading) return null

        return (
            <div className="well-bs no-padding-top col-md-12 no-border">
                <div className="container-category">
                    <h3>FashionItems your friends have bought</h3>
                </div>
                {this.state.recommendations.slice(0, 5).map((recommendation) => (
                    <ProductRow
                        fashionItem={recommendation}
                        fashionItemId={recommendation._key}
                        key={recommendation._key}
                    />
                ))}
            </div>
        )
    }
}

export default FriendsBought
