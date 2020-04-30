import {GridRequestMode} from './grid-request-mode';

let sortBySortModel = function(request) {
    const sortModel = request.sortModel;
    if (!sortModel || !sortModel.length) return;

    // const sorts = sortModel.map(function(s) {
    //     console.log("Sort model is - column: " + s.colId + ' sort: ' + s.sort);
    //     sortedRowsBlock = rowsForBlock.sort(this.compareValues(s.colId, s.sort));
    // });
    const key = sortModel[0].colId;
    const order = sortModel[0].sort || 'asc';
    this.sort(function(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
        );
    });
};

let containsFilter = function(row, column, value) {
    return row[column].toString().indexOf(value) > -1;
};

let equalsFilter = function(row, column, value) {
    return row[column].toString() === value;
};

let filterModelTypeToFuncDic = {'contains': containsFilter, 'equals': equalsFilter};

let filterByFilterModel = function(request) {
    let filteredData = this;

    const filterModel = request.filterModel;
    if (!filterModel) {
        return filteredData;
    }
    const filteredColumns = Object.keys(filterModel);
    if (filteredColumns.length === 0) {
        return filteredData;
    }

    const filters = filteredColumns.map(function(column) {
        console.log("Filter model is - column: " + column +
            ' filter type: ' + filterModel[column].type +
            ' filter value: ' + filterModel[column].filter +
            ' filter to: ' + filterModel[column].filterTo || '-');
        const filterUtil = filterModelTypeToFuncDic[filterModel[column].type];
        const filterValue = filterModel[column].filter;
        const toValue = filterModel[column].filterTo;
        filteredData = filteredData.filter(function (row, index, array){
            return filterUtil(row, column, filterValue, toValue)
        });
    });
    return filteredData;
};

export class ServerSideDatasource{
    constructor(serverDataReciever) {
        // this.rowsCount = null;
        this.serverDataReceiver = serverDataReciever;
        this.emptyColumnsList = [];
        this.columns = null;
        this.requestMode = GridRequestMode.GET_ROWS;
        this.lastBulk = undefined;
        this.lastRow = undefined;
        
        Array.prototype.sortBySortModel = sortBySortModel;
        Array.prototype.filterByFilterModel = filterByFilterModel;
    }

    setRequestMode(mode){
        this.requestMode = mode;
    }

    notifyError(params, error) {
        params.failCallback();
        params.parentNode.gridApi.dispatchEvent({
            type: 'failCallback',
            api: params.parentNode.gridApi,
            columnApi: params.parentNode.columnApi,
            error: error
        });
    }

    notifySuccess(originalRequest, resultRows) {
        originalRequest.successCallback(resultRows, this.lastRow);
        originalRequest.parentNode.gridApi.dispatchEvent({
            type: 'successCallback',
            originalRequest: originalRequest,
            resultRows: resultRows, 
            lastRow: this.lastRow
            // requestMode: this.requestMode
        });
        // this.requestMode = GridRequestMode.GET_ROWS;
    }

    // getRowsByScrollId = (params) => {
    //     //You can set any application data in grid and get it here
    //     // gridOptions.context = {reportingCurrency: value};
    //     let reportingCurrency = params.context.reportingCurrency;
    // };

    initColumnsByData(data) {
        if(data && data.length) {
            const firstRow = data[0];
            this.columns = Object.keys(firstRow).map(column => { return {
                    headerName: column,
                    field: column
                }
                }

            );
            //TMP: FOR TEST ONLY
            this.columns.push({headerName: "emptyColumn1", field: "emptyColumn1"});
            this.columns.push({headerName: "emptyColumn2", field: "emptyColumn2"});
            // this.setState({columnDefs:
            //     // [
            //     //     {
            //     //         headerName: this.props.tableName,
            //     //         headerGroupComponent: 'customHeaderGroupComponent',
            //     //         children:
            //     columns
            //     // }
            //     // ]
            // });
        }
        else {
            this.columns = [];
        }
        return this.columns;
    }

    //TODO: Call this method after each data scrolling and after first grid initialization
    updateEmptyColumnsList = (allColumns, data) => {
        const emptyColumnsCandidates = allColumns.map(col => col.field);
        // this.state.rowData.forEach(row => {
        data.forEach(row => {
            //For infinite row model, then gets called for each page loaded in the page cache.
            // this.gridApi.forEachNode((node, index) => {
            if(emptyColumnsCandidates.length > 0) {
                // const row = node.data;
                if(row) {
                    console.log("Row is: " + JSON.stringify(row));
                    const rowFields = Object.keys(row);
                    rowFields.forEach(field => {
                        if (row[field] || row[field] === 0) {
                            const fieldIndex = emptyColumnsCandidates.indexOf(field);
                            if (fieldIndex > -1) {
                                emptyColumnsCandidates.splice(fieldIndex, 1);
                            }
                        }
                    });
                }
                else {
                    console.warn("Empty row data!");
                }
            }
        });
        this.emptyColumnsList = emptyColumnsCandidates;
    };

    getEmptyColumns() {
        return this.emptyColumnsList;
    }

    setGridColumnDefs(gridApi, gridData) {
        if (!this.columns) {
            let columns = this.initColumnsByData(gridData);
            gridApi.setColumnDefs(columns);
        }
    }

    getRows = async (request) => {
        try {
            let response = await this.serverDataReceiver.getRowsBulk(request);
            let data = response.rows;
            this.setGridColumnDefs(request.parentNode.gridApi, data);
            console.log('getRows in GET_ROWS mode is asking for ' + request.request.startRow + ' to ' + request.request.endRow);
            this.updateEmptyColumnsList(this.columns, data);
            if(!this.lastRow && (!data || !data.length)) {
                this.lastRow = 0;
            }
            else {
                this.lastRow = response.lastRow;
            }
            this.lastBulk = data;
            // const filteredAndSortedRows = this.filterAndSortResults(request);
            this.notifySuccess(request, data);
            return data;
        }
        catch (error) {
            console.error('Failed to get rows. Error: ' + JSON.stringify(error));
            this.notifyError(request, error);
            return [];
        }
    };

    filterAndSortResults(request){
        if(this.lastBulk && this.lastBulk.length) {
            this.lastBulk.sortBySortModel(request);
            return this.lastBulk.filterByFilterModel(request);
        }
        else {
            return [];
        }
    }
}
