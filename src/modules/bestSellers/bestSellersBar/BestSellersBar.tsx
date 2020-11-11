import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import { NavItem } from "react-bootstrap";
import "../../../common/styles/gallery.css";

import f1 from "../../../images/bestSellers/f1.jpg";
import f12 from "../../../images/bestSellers/f12.jpg";
import f20 from "../../../images/bestSellers/f20.jpg";
import f26 from "../../../images/bestSellers/f26.jpg";
import f30 from "../../../images/bestSellers/f30.jpg";
import f35 from "../../../images/bestSellers/f35.jpg";

const bestSellers = [f1, f12, f20, f26, f30, f35];

export class BestSellersBar extends React.Component {
  render() {
    return (
      <div className="center ad-gallery nav">
        <div className="col-md-2 hidden-sm hidden-xs">
          <LinkContainer to="/best">
            <NavItem><h3>Fashionstore<br/>Best Sellers</h3></NavItem>
          </LinkContainer>
        </div>
        <div className="row">
          {bestSellers.map(fashionItem =>
            <div className="col-md-2 hidden-sm hidden-xs" key={fashionItem}>
              <LinkContainer to="/best">
                <NavItem><img src={fashionItem} className="thumbs" /></NavItem>
              </LinkContainer>
            </div>)}
        </div>
      </div>
    );
  }
}

export default BestSellersBar;