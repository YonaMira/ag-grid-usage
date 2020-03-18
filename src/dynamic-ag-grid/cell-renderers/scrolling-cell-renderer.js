import React from 'react';
import {Component} from "react";
import './scrolling-cell-renderer.css';

export class ScrollingCellRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        // return <div className="scrolling-cell-aa">{}</div>;
        if (this.props.value === undefined) {
            // when no node id, display the spinner image
            return <img src={require('../../resources/loading.gif')} />;
        } else {
            // otherwise just display node ID (or whatever you wish for this column)
            // return <textarea className="scrolling-cell">{this.props.value}</textarea>;
            return <div className="scrolling-cell" dangerouslySetInnerHTML={{__html: this.props.value}}/>;
            // return this.createDivElementWithInnerText(this.props.value);
        }
    }
}
