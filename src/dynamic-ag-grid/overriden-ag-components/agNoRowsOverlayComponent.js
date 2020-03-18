import React from 'react';
import {Component} from "react";

// To change the default loading 'no rows' overlay.
export class agNoRowsOverlayOverride extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return <span className="scrolling-cell">{"agNoRowsOverlay TODO: add loading component implementation here!"}</span>;
    }
}
