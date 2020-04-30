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
import {GridRequestMode} from "./data-source-engine/grid-request-mode";

const GridRowModel = {
    ClientSide: 'clientSide',
    ServerSide: 'serverSide'
}

export class DynamicAgGrid extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showEmptyColumnsInCurrentGridFlag: props.showEmptyColumnsInAllGridsFlag,
            showEmptyColumnsInAllGridsFlag: props.showEmptyColumnsInAllGridsFlag,
            rowModel: GridRowModel.ClientSide
        };

        this.rowHeight = 100;
        this.bulkSize = 10;
        this.lastBulkIndex = -1;
        this.rows = [];

        this.inBulkLoading = false;

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

    // create handler function
    myRowClickedHandler(event) {
        alert('The row was clicked');
    }

    onGridReady = async (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        this.registerGridEvents();
        if(this.state.rowModel === GridRowModel.ClientSide) {
            this.initClientSideRowModel();
        }
        else {
            this.initServerSideRowModel();
        }
    };

    initServerSideRowModel() {
        this.registerServerSideRowModelEvents();
        this.gridApi.setServerSideDatasource(this.datasource);
    }

    initClientSideRowModel = async() => {
        this.registerClientSideRowModelEvents();

        // let request = {parentNode: {gridApi: this.gridApi}, 
        //             failCallback: () => {}, 
        //             successCallback: (params) => {}, 
        //             request: {startRow: 0, endRow: 100}};
        // const rows = await this.datasource.getRows(request); 
        // // this.rowData = this.rowData.concat(rows);
        // //TODO: sort and filter according to appropriate models
        // this.gridApi.setRowData(rows);  
        
        this.getNextRowsBulk();    
    }

    getNextRowsBulk = async() => {
        //TODO: compare this.rowData.length with table.total and unregister to bodyScroll event 
        //Anyway don't enter this method if all data already loaded to grid.
        this.lastBulkIndex = this.lastBulkIndex + 1;
        const startRow = this.lastBulkIndex * this.bulkSize;
        let request = {parentNode: {gridApi: this.gridApi}, 
                    failCallback: () => {}, 
                    successCallback: (params) => {}, 
                    request: {startRow: startRow, endRow: startRow + this.bulkSize}};
        const rows = await this.datasource.getRows(request); 
        this.rows = this.rows.concat(rows);
        //TODO: sort and filter according to appropriate models
        this.gridApi.setRowData(this.rows); 
        return rows; 
    }

    unregisterGridEvents = () => {

    }

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
        return this.rowHeight;//params.data.rowHeight;
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
                        enableSorting={this.state.rowModel === GridRowModel.ClientSide}
                        enableFilter={this.state.rowModel === GridRowModel.ClientSide}
                        enableRangeSelection={true}
                        suppressRowClickSelection={true}
                        animateRows={true}
                        // onModelUpdated: modelUpdated,
                        debug={true}
                        autoSizeColumns={true}
                        // rowHeight={100}
                        getRowHeight={this.getRowHeight.bind(this)}
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
                        suppressMenuHide={true}

                        // postSort= {this.onPostSort.bind(this)} // Doesn't work
                        
                        // floatingFilter = {true}
                        //Server side data source related properties
                        // datasource = {this.datasource}
                        // tell grid we want virtual row model type
                        rowModelType = {this.state.rowModel}
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
                        // infiniteInitialRowCount = {1000}
                        // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
                        // pages are never purged. this should be set for large data to stop your browser from getting
                        // full of data
                        maxBlocksInCache = {1}
                        cacheBlockSize = {this.bulkSize}
                        // enableServerSideFilter = {false}
                        // enableServerSideSorting = {false}
                    >
                    </AgGridReact>
                </div>
            </div>
        );
    }

    registerGridEvents = () => {
        // this.gridApi.addEventListener('rowClicked', this.myRowClickedHandler);        
        this.gridApi.addEventListener('firstDataRendered', this.onFirstDataRendered);
        // this.gridApi.addEventListener('modelUpdated', this.onModelUpdated);
        // this.gridApi.addEventListener('componentStateChanged', this.onComponentStateChanged);
        // this.gridApi.addEventListener('postSort', this.onPostSort); // Doesn't work
    }

    registerClientSideRowModelEvents = () => {
        this.gridApi.addEventListener('bodyScroll', this.onGridBodyScrollCallback);
    }

    registerServerSideRowModelEvents = () => {
        // this.gridApi.addEventListener('sortChanged', this.onSortChanged);
        // this.gridApi.addEventListener('filterChanged', this.onFilterChanged);
        this.gridApi.addEventListener('failCallback', this.onGetRowsFailedCallback);
        this.gridApi.addEventListener('successCallback', this.onGetRowsSucceededCallback);
    }

    //This event handler is relevant for ClientSide row model only in our implementation.
    //We implement dynamic data loading by this event handling.
    onGridBodyScrollCallback = async params => {
        this.gridApi.removeEventListener('bodyScroll', this.onGridBodyScrollCallback);
        if(params.direction === "vertical") {
            const lastDisplayedNodeIndex = this.gridApi.getLastDisplayedRow();
            console.log("Last displayed node is: " + lastDisplayedNodeIndex);
            if(this.rows.length === lastDisplayedNodeIndex + 1) {
                
                const rowsBulk = await this.getNextRowsBulk();

                if(rowsBulk && rowsBulk.length > 0) {
                    this.gridApi.ensureIndexVisible(lastDisplayedNodeIndex + 1, 'top');
                }           
            }
        }
        this.gridApi.addEventListener('bodyScroll', this.onGridBodyScrollCallback);
    }

    onGetRowsFailedCallback = params => {
        this.gridApi.hideOverlay();
        console.error('onGetRowsFailedCallback', params); 
        alert("Failed to getRows");
        //Show user notification about error here.
    }

    onGetRowsSucceededCallback = params => {
        if(params.lastRow === 0) {
            //The infinite and Server side row models do not use overlays like the Client-side Row Model.
            //It does not use 'loading' overlay as rows load in blocks as it would be wrong to hide all 
            //the grid because some rows are getting loaded. The grid does not use 'no rows' overlay 
            //as the 'no rows' could be because you have a filter set, and a grid with a filter 
            //shows an empty grid when no rows pass the filter.
            this.gridApi.showNoRowsOverlay(); 
        }
    }

    updateDataBySortAndFilterModel(request) {
        // request.parentNode.gridApi.forEachNode
        alert("updateDataBySortAndFilterModel");
        request.parentNode.gridApi.purgeServerSideCache();
    }

    onSortChanged = (params) => {
        alert("On sort changed called");
        this.datasource.setRequestMode(GridRequestMode.SORTING);
    }

    onPostSort = (params) => {
        alert("onPostSort called");
    }

    onFilterChanged = (params) => {
        alert("On filter changed called");
        this.datasource.setRequestMode(GridRequestMode.FILTERING);
    }

    onFirstDataRendered = (params) => {
        // alert("onFirstDataRendered");
        // if(this.rowModel === GridRowModel.ServerSide && 
        //     (!params.resultRows || !params.resultRows.length)) {
        //     //The infinite and Server side row models do not use overlays like the Client-side Row Model.
        //     //It does not use 'loading' overlay as rows load in blocks as it would be wrong to hide all 
        //     //the grid because some rows are getting loaded. The grid does not use 'no rows' overlay 
        //     //as the 'no rows' could be because you have a filter set, and a grid with a filter 
        //     //shows an empty grid when no rows pass the filter.
        //     this.gridApi.showNoRowsOverlay(); 
        // }
    }

    onModelUpdated = (params) => {
        alert("onModelUpdated called");
    }

    onComponentStateChanged = (params) => {
        alert("onComponentStateChanged called");
    }
}
