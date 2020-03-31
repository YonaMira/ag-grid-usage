export class ServerSideDatasource{
    constructor(serverDataReciever) {
        // this.rowsCount = null;
        this.serverDataReceiver = serverDataReciever;
        this.emptyColumnsList = [];
        this.columns = null;
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
            console.log('asking for ' + request.startRow + ' to ' + request.endRow);
            this.updateEmptyColumnsList(this.columns, data);
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
