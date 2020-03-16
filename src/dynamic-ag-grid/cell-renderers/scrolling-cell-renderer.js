import React from 'react';
import {Component} from "react";

export class ScrollingCellRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return <span>{this.props.value}</span>;
    }
}
