import React from 'react';

export class ServerSideDatasource{
    constructor(serverDataReciever) {
        // this.rowsCount = null;
        this.serverDataReceiver = serverDataReciever;
        this.emptyColumnsList = [];
    }

    // getRowsByScrollId = (params) => {
    //     //You can set any application data in grid and get it here
    //     // gridOptions.context = {reportingCurrency: value};
    //     let reportingCurrency = params.context.reportingCurrency;
    // };

    initColumnsByData(data) {
        if(data && data.length) {
            const firstRow = data[0];
            const columns = Object.keys(firstRow).map(column => { return {
                    headerName: column,
                    field: column
                }
                }

            );
            //TMP: FOR TEST ONLY
            columns.push({headerName: "emptyColumn1", field: "emptyColumn1"});
            columns.push({headerName: "emptyColumn2", field: "emptyColumn2"});
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
            return columns;
        }
        return [];
    }

    //TODO: Call this meghod after each data scrolling and after first grid initialization
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

    getRows = async (request) => {
        try {
            let response = await this.serverDataReceiver.getRowsBulk(request);
            let data = response.rows;
            let columns = this.initColumnsByData(data);
            this.updateEmptyColumnsList(columns, data);
            request.parentNode.gridApi.setColumnDefs(columns);
            console.log('asking for ' + request.startRow + ' to ' + request.endRow);
            const rowsThisPage = data.slice(request.startRow, request.endRow);
            let lastRow = -1;
            if (data.length <= request.endRow) {
                lastRow = response.lastRow;
            }
            request.successCallback(rowsThisPage, lastRow);
            request.parentNode.gridApi.sizeColumnsToFit();
        }
        catch (error) {
            console.error('Failed to get rows. Error: ' + JSON.stringify(error));
        }
    };
}
