import React from 'react';
import {Component} from "react";

export class GridTitleRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return <div>
            <h1>{'HERE WiLL BE GRID TITLE'}</h1>
            <button type="button" onClick={this.switchEmptyColumnsVisibility}>
                {this.state.showEmptyColumnsInCurrentGridFlag ? "Hide empty columns in this table" : "Show empty columns in this table"}
            </button>
        </div>
    }
}
