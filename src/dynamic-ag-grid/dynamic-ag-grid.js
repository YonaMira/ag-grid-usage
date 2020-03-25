import React from 'react';
import {Component} from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import {ServerSideDatasource} from './data-source-engine/server-side-datasource';
import {GridTitleRenderer} from './grid-elements-renderers/column-headers-renderers/grid-title-renderer/grid-title-column-renderer';

//ag-Grid themes
import 'ag-grid-enterprise/dist/styles/ag-theme-material.css';
import 'ag-grid-enterprise/dist/styles/ag-theme-fresh.css';
import 'ag-grid-enterprise/dist/styles/ag-theme-balham.css';

import 'ag-grid-enterprise';
import {compareDates} from './ag-grid-utils/comparators/date-comparator';
import {ScrollingCellRenderer} from './grid-elements-renderers/cell-renderers/scrolling-cell-renderer/scrolling-cell-renderer';
// do not delete this import - this is overriding of framework component.
import {agLoadingOverlayOverride} from './overriden-ag-components/agLoadingOverlayComponent';
// do not delete this import - this is overriding of framework component.
import {agNoRowsOverlayOverride} from './overriden-ag-components/agNoRowsOverlayComponent';
import {agColumnHeaderOverride} from './overriden-ag-components/agColumnHeaderComponent';
import './dynamic-ag-grid.css';
import {ServerDataReceiver} from "./data-source-engine/server-data-reciever";

export class DynamicAgGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showEmptyColumnsInCurrentGridFlag: props.showEmptyColumnsInAllGridsFlag,
            showEmptyColumnsInAllGridsFlag: props.showEmptyColumnsInAllGridsFlag
        };

        this.dataReceiver = new ServerDataReceiver(this.props.tableName);
        this.datasource = new ServerSideDatasource(this.dataReceiver);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.showEmptyColumnsInAllGridsFlag !== nextProps.showEmptyColumnsInAllGridsFlag) {
            this.setState({
                showEmptyColumnsInAllGridsFlag: nextProps.showEmptyColumnsInAllGridsFlag
            });
            this.changeEmptyColumnsVisibility(nextProps.showEmptyColumnsInAllGridsFlag);
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        this.gridApi.setServerSideDatasource(this.datasource);
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

    switchEmptyColumnsVisibility = () => {
        this.changeEmptyColumnsVisibility(!this.state.showEmptyColumnsInCurrentGridFlag);
    };

    changeEmptyColumnsVisibility(isVisible) {
        if(this.state.showEmptyColumnsInCurrentGridFlag !== isVisible) {
            this.setState({showEmptyColumnsInCurrentGridFlag: isVisible});
            const emptyColumnsList = this.datasource.getEmptyColumns();
            if (emptyColumnsList.length){
                emptyColumnsList.forEach(column => {
                    this.changeColumnVisibility(column, isVisible);
                });
            }
            this.gridApi.sizeColumnsToFit();
        }
    }

    render() {
        return (
            <div>
                <button type="button" onClick={this.switchEmptyColumnsVisibility}>
                    {this.state.showEmptyColumnsInCurrentGridFlag ? "Hide empty columns in this table" : "Show empty columns in this table"}
                </button>
                {/*TODO: It's possible to change this class for using another grid theme.*/}
                <div className="ag-theme-balham dynamic-grid">
                    <AgGridReact
                        frameworkComponents={{ customHeaderGroupComponent: GridTitleRenderer}}
                        // columnDefs={this.state.columnDefs}
                        // rowData={this.state.rowData}
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
                            headerClass: 'resizable-header',


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
                        floatingFilter = {true}
                        //Server side data source related properties
                        // datasource = {this.datasource}
                        // tell grid we want virtual row model type
                        rowModelType = 'serverSide'
                        pagination = {false}
                        // paginationAutoPageSize = {true}
                        // how big each page in our page cache will be, default is 100
                        // paginationPageSize = {100}
                        // how many extra blank rows to display to the user at the end of the dataset,
                        // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
                        // default is 1, ie show 1 row.
                        cacheOverflowSize = {2}
                        // how many server side requests to send at a time. if user is scrolling lots, then the requests
                        // are throttled down
                        maxConcurrentDatasourceRequests = {1}
                        // how many rows to initially show in the grid. having 1 shows a blank row, so it looks like
                        // the grid is loading from the users perspective (as we have a spinner in the first col)
                        infiniteInitialRowCount = {1000}
                        // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
                        // pages are never purged. this should be set for large data to stop your browser from getting
                        // full of data
                        maxBlocksInCache = {10}
                        enableServerSideFilter = {false}
                        enableServerSideSorting = {false}

                        // define specific column types
                        columnTypes = {
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
            </div>
        );
    }
}
