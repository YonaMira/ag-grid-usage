import React from 'react';

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

export class ServerDataReceiver{
    constructor(tableName) {
        this.rowsCount = null;
        this.tableName = tableName;
        this.allData = null;
        this.httpRequest = new XMLHttpRequest();
        this.httpRequest.open(
            'GET',
            'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'
        );
        Array.prototype.sortBySortModel = sortBySortModel;
        Array.prototype.filterByFilterModel = filterByFilterModel;
    }

    initializeFakeData = () => {
       return new Promise((resolve, reject) => {
           try {
               this.httpRequest.send();
               this.httpRequest.onreadystatechange = () => {
                   if (this.httpRequest.readyState === 4) {
                       if (this.httpRequest.status === 200) {
                           resolve(JSON.parse(this.httpRequest.responseText));
                       } else {
                           reject(this.httpRequest.status);
                       }
                   }
               };
           }
           catch (error) {
               reject(error);
           }
        });
    };

    getRowsByScrollId = (params) => {
        //You can set any application data in grid and get it here
        // gridOptions.context = {reportingCurrency: value};
        let reportingCurrency = params.context.reportingCurrency;
    };

    getRowsBulk = async (request) => {
        if(!this.allData) {
            this.allData = await this.initializeFakeData();
        }
        if(!request.request) {
            return;
        }
        request = request.request;
        let rowsForBlock = this.allData.slice(request.startRow, request.endRow);
        // this.printSortModel(request);
        rowsForBlock.sortBySortModel(request);
        rowsForBlock = rowsForBlock.filterByFilterModel(request);

        const lastRow = this.getLastRowIndex(request, rowsForBlock);
        return {
            success: true,
            rows: rowsForBlock,
            lastRow: lastRow
        };
    };

    getLastRowIndex(request, results) {
        if (!results || results.length === 0) return -1;
        let currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    filterData(request, rowsForBlock) {
        const filterModel = request.filterModel;
        if (!filterModel) {
            return rowsForBlock;
        }
        const filteredColumns = Object.keys(filterModel);
        if (filteredColumns.length === 0) return rowsForBlock;

        const filters = filteredColumns.map(function(column) {
            console.log("Filter model is - column: " + column +
                ' filter type: ' + filterModel[column].type +
                ' filter value: ' + filterModel[column].filter +
                ' filter to: ' + filterModel[column].filterTo || '-');
        });
        return rowsForBlock;
    }

    // printSortModel(request){
    //     const sortModel = request.sortModel;
    //     if (!sortModel || !sortModel.length) return;
    //
    //     const sorts = sortModel.map(function(s) {
    //         console.log("Sort model is - column: " + s.colId + ' sort: ' + s.sort);
    //     });
    // }

    // printFilterModel(request){
    //     const filterModel = request.filterModel;
    //     if (!filterModel) {
    //         return;
    //     }
    //     const filteredColumns = Object.keys(filterModel);
    //     if (filteredColumns.length === 0) return;
    //
    //     const filters = filteredColumns.map(function(column) {
    //         console.log("Filter model is - column: " + column +
    //             ' filter type: ' + filterModel[column].type +
    //             ' filter value: ' + filterModel[column].filter +
    //             ' filter to: ' + filterModel[column].filterTo || '-');
    //     });
    // }

    //Elastic sort request:
    //POST /_search
    // {
    //     "query" : {
    //         "term" : { "product" : "chocolate" }
    //     },
    //     "sort" : [
    //         {"price" : {"order" : "asc", "mode" : "avg"}}
    //     ]
    // }
}