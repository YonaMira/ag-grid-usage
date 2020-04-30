import React from 'react';


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
        // rowsForBlock.sortBySortModel(request);
        // rowsForBlock = rowsForBlock.filterByFilterModel(request);

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