import React from 'react';
import {Component} from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-enterprise';
import {compareDates} from './ag-grid-utils/comparators/date-comparator';
import {ScrollingCellRenderer} from './cell-renderers/scrolling-cell-renderer';

export class DynamicAgGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: "Make", field: "make" },
                { headerName: "Model", field: "model" },
                { headerName: "Price", field: "price" }],
            rowData: [
                { make: "Toyota", model: "Celicaasdgas;dlgaskdgja;sldgkjas;dgja;lsdkjga;lsdkjg;alsjdg;alskdjg;alskjdg;asjkdg;alksjdg;alkjsdg;a", price: 35000 },
                { make: "Ford", model: "Mondeo", price: 32000 },
                { make: "Porsche", model: "Boxter", price: 72000 }]
        }

        // this.gridOptions = {
        //     // default ColDef, gets applied to every column
        //     defaultColDef: {
        //         // set the default column width
        //         width: 50,
        //         // make every column editable
        //         editable: false,
        //         // make every column use 'text' filter by default
        //         filter: 'agTextColumnFilter',
        //
        //     },
        //     floatingFilter: true,
        //     rowModelType: 'infinite',
        //     // datasource: myDataSource,
        //
        //     // define specific column types
        //     columnTypes: {
        //         numberColumn: {width: 83, filter: 'agNumberColumnFilter'},
        //         medalColumn: {width: 100, columnGroupShow: 'open', filter: false},
        //         nonEditableColumn: {editable: false},
        //         dateColumn: {
        //             // specify we want to use the date filter
        //             filter: 'agDateColumnFilter',
        //             // add extra parameters for the date filter
        //             filterParams: {
        //                 // provide comparator function
        //                 comparator:compareDates.bind(this)
        //             }
        //         }
        //     }
        // }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        // this.gridApi.sizeColumnsToFit();
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

    render() {
        return (
            <div className="ag-theme-balham" style={ {height: '200px', width: '600px'} }>
                <AgGridReact
                    columnDefs={this.state.columnDefs}
                    rowData={this.state.rowData}
                    onGridReady={this.onGridReady.bind(this)}
                    rowDataChangeDetectionStrategy='IdentityCheck'
                    animateRows
                    // default ColDef, gets applied to every column
                    defaultColDef= {{
                        // set the default column width
                        // width: 50,
                        // make every column editable
                        editable: false,
                        sortable: true,
                        resizable: true,
                        skipHeaderOnAutoSize: true,

                        // make every column use 'text' filter by default
                        filter: 'agTextColumnFilter',
                        cellRendererFramework: ScrollingCellRenderer

                    }}
                floatingFilter= {true}
                // rowModelType = 'infinite'
                // datasource: myDataSource,

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


                    // setting grid wide date component
                    // dateComponentFramework={DateComponent}

                    // setting default column properties
                    // defaultColDef={{
                    //     headerComponentFramework: SortableHeaderComponent,
                    //     headerComponentParams: {
                    //         menuIcon: 'fa-bars'
                    //     }
                    // }}
                >
                </AgGridReact>
            </div>
        );
    }
}
