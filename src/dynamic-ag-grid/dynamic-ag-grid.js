import React from 'react';
import {Component} from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import {InfiniteScrollingDatasource} from './data-source-engine/infinite-scrolling-datasource';
import {ScrollBox, ScrollAxes, FastTrack} from 'react-scroll-box'; // ES6

//ag-Grid themes
import 'ag-grid-enterprise/dist/styles/ag-theme-material.css';
import 'ag-grid-enterprise/dist/styles/ag-theme-fresh.css';
import 'ag-grid-enterprise/dist/styles/ag-theme-balham.css';

import 'ag-grid-enterprise';
import {compareDates} from './ag-grid-utils/comparators/date-comparator';
import {ScrollingCellRenderer} from './cell-renderers/scrolling-cell-renderer';
// do not delete this import - this is overriding of framework component.
import {agLoadingOverlayOverride} from './overriden-ag-components/agLoadingOverlayComponent';
// do not delete this import - this is overriding of framework component.
import {agNoRowsOverlayOverride} from './overriden-ag-components/agNoRowsOverlayComponent';
import {agColumnHeaderOverride} from './overriden-ag-components/agColumnHeaderComponent';
import './dynamic-ag-grid.css';

export class DynamicAgGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: "Make", field: "make" },
                { headerName: "Model", field: "model" },
                { headerName: "Price", field: "price" }],
            rowData: [
                { make: "Toyota",
                    model: "Efficient honorificabilitudinitatibus cross-media information without floccinaucinihilipilification cross-media value. Quickly maximize timely deliverables for real-time schemas plenipotentiary.",
                    price: 35000,
                    cellStyle: {'white-space': 'normal'}},
                { make: "Ford", model: '<em class="hlt">Mon</em>deo', price: 32000},
                { make: "Porsche", model: "Boxter", price: 72000 }]
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        // this.gridApi.setDatasource(InfiniteScrollingDatasource);

        this.gridApi.sizeColumnsToFit();
        // this.columnApi.autoSizeColumns([[0, 1, 2]]);
        // this.autoSizeAll(false);
    };

    changeColumnVisibility(columnName, visible) {
        // this.api.selectAll();
        this.columnApi.setColumnVisible(columnName, visible);
    }

    onColumnResized = (params) => {
        console.log(params);
    };

    sizeToFit() {
        this.gridApi.sizeColumnsToFit();
    }

    autoSizeAll(skipHeader) {
        const allColumnIds = [];
        this.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId);
        });

        this.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    }

    getRowHeight(params) {
        return 100;//params.data.rowHeight;
    }

    render() {
        return (
            //TODO: It's possible to change this class for using another grid theme.
            <div className="ag-theme-balham" style={ {height: '700px', width: '800px'} }>
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onGridReady={this.onGridReady.bind(this)}
                    rowDataChangeDetectionStrategy='IdentityCheck'
                    enableColResize={true}
                    enableSorting={true}
                    enableFilter={true}
                    enableRangeSelection={true}
                    suppressRowClickSelection={true}
                    animateRows={true}
                    // onModelUpdated: modelUpdated,
                    debug={true}
                    autoSizeColumns={true}
                    // rowHeight={100}
                    getRowHeight={this.getRowHeight}
                    // default ColDef, gets applied to every column
                    defaultColDef= {{
                        cellClass: "cell-wrap",
                        // set the default column width
                        // width: 50,
                        // make every column editable
                        editable: false,
                        // sortable: true,
                        resizable: true,
                        skipHeaderOnAutoSize: true,


                        // make every column use 'text' filter by default
                        filter: 'agTextColumnFilter',
                        cellEditor: 'agLargeTextCellEditor',
                        // cellEditorParams: {
                        //     values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
                        // },
                        cellRendererFramework: ScrollingCellRenderer,
                        loadingOverlayRendererFramework: agLoadingOverlayOverride,// TODO: It is possible to set Circular component here.
                        noRowsOverlayRendererFramework: agNoRowsOverlayOverride,
                        // headerComponentFramework: agColumnHeaderOverride // This override is checked - it working and can be used.
                        // headerComponentFramework: SortableHeaderComponent,
                        // headerComponentParams: {
                        //    menuIcon: 'fa-bars'
                        // }
                        // setting grid wide date component
                        // dateComponentFramework={DateComponent}
                    }}
                floatingFilter= {true}
                // rowModelType = 'infinite'
                // datasource: InfiniteScrollingDatasource

                // define specific column types
                columnTypes={
                    {
                        numberColumn: {width: 83, filter: 'agNumberColumnFilter'},
                        medalColumn: {width: 100, columnGroupShow: 'open', filter: false},
                        nonEditableColumn: {editable: false},
                        dateColumn: {
                            // specify we want to use the date filter
                            filter: 'agDateColumnFilter',
                            // add extra parameters for the date filter
                            filterParams: {
                                // provide comparator function
                                comparator:compareDates.bind(this)
                            }
                        }
                    }
                }
                onColumnResized={this.onColumnResized.bind(this)}
                >
                </AgGridReact>
            </div>
        );
    }
}
