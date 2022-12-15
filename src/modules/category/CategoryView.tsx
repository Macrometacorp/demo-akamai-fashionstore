import React, { Component } from "react"
import { CategoryNavBar } from "./categoryNavBar/CategoryNavBar"
import { SearchBar } from "../search/searchBar/SearchBar"
import { BestSellersBar } from "../bestSellers/bestSellersBar/BestSellersBar"
import { CategoryGallery } from "./CategoryGallery"

import men from "../../images/hero/hero-men.png"
import women from "../../images/hero/hero-women.png"
import kids from "../../images/hero/hero-kids.png"
import bags from "../../images/hero/hero-bags.png"
import home from "../../images/hero/hero-homewear.jpg"
import sports from "../../images/hero/hero-sportswear.png"
import designer from "../../images/hero/hero-designer.png"

import "../../common/hero/hero.css"
import { categories } from "./categoryNavBar/categories"

interface CategoryViewProps {
    match: any
}

export default class CategoryView extends Component<CategoryViewProps> {
    getImage = () => {
        switch (this.props.match.params.id) {
            case categories.men:
                return men
            case categories.women:
                return women
            case categories.kids:
                return kids
            case categories.bags:
                return bags
            case categories.home:
                return home
            case categories.sports:
                return sports
            case categories.designer:
                return designer
            default:
                return women
        }
    }

    render() {
        return (
            <div className="Category">
                <SearchBar />
                <CategoryNavBar />
                <BestSellersBar />
                <img
                    src={this.getImage()}
                    alt={`${this.getImage()} hero`}
                    className="img-fluid full-width top-hero-padding"
                />
                <CategoryGallery match={this.props.match} />
            </div>
        )
    }
}
