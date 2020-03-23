import React from 'react';

export class InfiniteScrollingDatasource{
    constructor(tableName, data) {
        this.rowsCount = null;
        this.tableName = tableName;
        this.data = data;
        // this.httpRequest = new XMLHttpRequest();
        // this.httpRequest.open(
        //     'GET',
        //     'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'
        // );
    }
    // getGridRows = () => {
    //    return new Promise((resolve, reject) => {
    //        try {
    //            this.httpRequest.send();
    //            this.httpRequest.onreadystatechange = () => {
    //                if (this.httpRequest.readyState === 4) {
    //                    if (this.httpRequest.status === 200) {
    //                        resolve(JSON.parse(this.httpRequest.responseText));
    //                    } else {
    //                        reject(this.httpRequest.status);
    //                    }
    //                }
    //            };
    //        }
    //        catch (error) {
    //            reject(error);
    //        }
    //     });
    // };

    getRows = (params) => {
        try {
            const data = this.data;
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout(function () {
                const rowsThisPage = data.slice(params.startRow, params.endRow);
                let lastRow = -1;

                if (data.length <= params.endRow) {
                    lastRow = data.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
        catch (error) {
            console.error('Failed to get rows. Error: ' + JSON.stringify(error));
        }
    };
}
