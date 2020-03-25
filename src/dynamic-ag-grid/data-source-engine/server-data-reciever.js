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
        let rowsForBlock = this.allData.slice(request.startRow, request.endRow);
        const lastRow = this.allData.length;
        return {
            success: true,
            rows: rowsForBlock,
            lastRow: lastRow,
        };
    };
}