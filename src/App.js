import React, {Component} from 'react';
import {DynamicAgGrid} from './dynamic-ag-grid/dynamic-ag-grid';
import './App.css';

export class App extends Component {
  constructor(params) {
    super(params);
    this.state = {
      emptyColumnsVisible: true
    }
  }

  render() {
    return (
        <div>
          <button type="button" onClick={() => {
            this.setState({emptyColumnsVisible: !this.state.emptyColumnsVisible});
          }}>{this.state.emptyColumnsVisible ? "Hide empty columns in all tables" : "Show empty columns in all tables"}</button>
          <DynamicAgGrid
            showEmptyColumnsInAllGridsFlag={this.state.emptyColumnsVisible}
            tableName={'Test1'}
          />
          <DynamicAgGrid
              showEmptyColumnsInAllGridsFlag={this.state.emptyColumnsVisible}
              tableName={'Test2'}
          />
        </div>
    );
  }
}

export default App;
