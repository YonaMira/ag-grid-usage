import React from 'react';
import {Component} from "react";

// To change the default 'loading' overlay.
export class agColumnHeaderOverride extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return <span className="scrolling-cell">{"agColumnHeader TODO: add loading component implementation here!"}</span>;
    }
}
