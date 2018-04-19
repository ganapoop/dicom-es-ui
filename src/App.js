import React, { Component } from 'react';
import Axios from 'axios';
import { Layout, Button, Input, Table, Icon, Divider, Avatar, Breadcrumb, Row, Col} from 'antd';
import logo from './logo.png';

import Viewer from './Viewer';

const Search = Input.Search;

const {Header, Content, Footer} = Layout;


class App extends Component {
  constructor() {
    super();
    this.state = {
      query: '',
      dicom: [],
      selectedRowKeys: [],
      selectedRows: [],
      filteredInfo: null,
      sortedInfo: null,
      view: 'search'
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.clearAll = this.clearAll.bind(this);
    // this.setDateSort = this.setDateSort.bind(this);
    this.enterIconLoading = this.enterIconLoading.bind(this);
  }
  
  componentDidMount() {
    this.getSearchResults('');
  }
  
  handleChange(e) {
    let { value } = e.target
    
    this.setState({
      query: value
    });
  }
  
  getSearchResults(query) {
    Axios.get(`http://localhost:5005/search?q=${query}`)
    .then(({data}) => {
      // console.log(`return payload from server after query submission: ${JSON.stringify(data)}, ${Array.isArray(data)}`);
      this.setState({
        dicom: data
      });
    })
    .catch((err) => console.error(`ERROR when querying server: ${err}`));
  }

  handleTableChange(pagination, filters, sorter) {
    console.log('Various parameters', pagination, filters, sorter);
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
  }

  clearFilters() {
    this.setState({ filteredInfo: null });
  }
  
  clearAll() {
    this.setState({
      filteredInfo: null,
      sortedInfo: null,
    });
  }

  // setDateSort() {
  //   this.setState({
  //     sortedInfo: {
  //       order: 'descend',
  //       columnKey: 'studyDate',
  //     },
  //   });
  // }

  enterIconLoading = (e) => {
    this.setState({ 
      // iconLoading: e.target.value
      view: e.target.value
    });
  }
  
  render() {
    let modalities = this.state.dicom.reduce((filters, record) => {
      if (!filters.includes(record.modality)) {
        filters.push(record.modality);
      }

      return filters;
    }, []);


    let scans = this.state.dicom.reduce((scanList, record) => {
      if (!scanList.includes(record.sopInstanceUID)) {
        scanList.push(record.sopInstanceUID);
      }
      return scanList;
    }, []);

    let instruments = this.state.dicom.reduce((instrumentList, record) => {
      if (!instrumentList[0].includes(record.manufacturerModelName)) {
        instrumentList[0].push(record.manufacturerModelName);
        instrumentList[1].push({mf: record.manufacturer, modelName: record.manufacturerModelName});
      }
      return instrumentList;
    }, [[], []])[1];
    
    let { sortedInfo, filteredInfo } = this.state;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};


    const columns = [
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'pName',
      render: text => <a href="javascript:;">{text}</a>,
    }, {
      title: 'PatientID',
      dataIndex: 'patientId',
      key: 'pID',
    }, {
      title: 'Patient Sex',
      dataIndex: 'patientSex',
      key: 'pSex',
      width: '5rem',
      filters: [
        { text: 'Male', value: 'M' },
        { text: 'Female', value: 'F' },
      ],
      filteredValue: filteredInfo.pSex || null,
      onFilter: (value, record) => record.patientSex === value,
    }, {
      title: 'SOPInstanceUID',
      dataIndex: 'sopInstanceUID',
      key: 'sopUID',
      width: '14rem',
      render: text => <a href="javascript:;">{text}</a>,
      sorter: (a, b) => a.sopInstanceUID.length - b.sopInstanceUID.length,
      sortOrder: sortedInfo.columnKey === 'sopUID' && sortedInfo.order,
      filters: scans.map((scan) => ({ text: scan, value: scan })),
      filteredValue: filteredInfo.sopUID || null,
      onFilter: (value, record) => record.sopInstanceUID.includes(value),
    }, {
      title: 'Study Date',
      dataIndex: 'studyDate',
      key: 'studyDate',
      sorter: (a, b) => a.studyDate > b.studyDate,
      sortOrder: sortedInfo.columnKey === 'studyDate' && sortedInfo.order,
    }, {
      title: 'Study Description',
      dataIndex: 'studyDescription',
      key: 'studyDesc',
    }, {
      title: 'Modality',
      dataIndex: 'modality',
      key: 'mod',
      filters: modalities.map((modality) => ({ text: modality, value: modality })),
      filteredValue: filteredInfo.mod || null,
      onFilter: (value, record) => record.modality.includes(value),
    }, {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'mf',
      sorter: (a, b) => a.manufacturer > b.manufacturer,
      sortOrder: sortedInfo.columnKey === 'mf' && sortedInfo.order,
    }, {
      title: 'Instrument Model Name',
      dataIndex: 'manufacturerModelName',
      key: 'modelName',
      width: '14rem',
      filters: instruments.map((instrument) => ({ text: instrument.mf + ' ' + instrument.modelName, value: instrument.modelName })),
      filteredValue: filteredInfo.modelName || null,
      onFilter: (value, record) => record.manufacturerModelName.includes(value)
    }, {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">
            <Button type="primary" icon="picture" value={record.sopInstanceUID} loading={this.state.iconLoading === record.sopInstanceUID} onClick={this.enterIconLoading}>
              View this {record.modality} scan
            </Button>
          </a>
          {/* <Divider type="vertical" />
          <a href="javascript:;">Delete</a>
          <Divider type="vertical" />
          <a href="javascript:;" className="ant-dropdown-link">
            More actions <Icon type="down" />
          </a> */}
        </span>
      ),
    }
    ];



    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    
        this.setState({
          selectedRowKeys: selectedRowKeys,
          selectedRows: selectedRows
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    const downloadButton = () => {
      if (this.state.selectedRows.length === 0) {
        return (
          <Button type="dashed" disabled>
            <Icon type="cloud-download" /> Download Selected Files
        </Button>);
      } else {
        return (
          <Button onClick={this.setAgeSort} type="primary" >
            <Icon type="cloud-download" /> Download {this.state.selectedRows.length} Selected {this.state.selectedRows.length === 1 ? 'File' : 'Files'}
      </Button>)
      }
    };

    const tableTitle = () => {
      return (
        <div>
          <Button onClick={this.clearFilters}>Clear filters</Button>
          <Button onClick={this.clearAll}>Clear filters and sorters</Button>
          {downloadButton()}
        </div>
      );
    }

    // this.state.query === null ? () : 

    //testing viewer implementation
    const imageId =
  "https://rawgit.com/cornerstonejs/cornerstoneWebImageLoader/master/examples/Renal_Cell_Carcinoma.jpg";

    const stack = {
      imageIds: [imageId],
      currentImageIdIndex: 0
    };

    return (
      <Layout className="layout">
        <Header style={{ display: 'inline-block', height: 64, width: '100%'}}>
          <Row style={{ height: 64 }}>
          <img src={logo}  style={{ paddingRight: 24, maxHeight: 38 }} />
            <div style={{ display: 'inline-block'}}>
              {this.state.view === 'search' ? (
                <Search
                  placeholder="input search text"
                  value={this.state.query}
                  onSearch={() => this.getSearchResults(this.state.query)}
                  onChange={this.handleChange}
                  enterButton
                  style={{ width: 600 }}
                />
              ) : (
                  <h1 style={{ color: 'white', fontWeight: 500 }}>Viewing Scan: {this.state.view}</h1>
                )}
            </div>
          </Row>
        </Header>
        <Content>
          {this.state.view === 'search' ? (
            <div>
              <Breadcrumb style={{ paddingTop: '.4rem' }}>
                <Breadcrumb.Item>INDUS DICOM EXPLORER</Breadcrumb.Item>
                <Breadcrumb.Item><a href="">Search</a></Breadcrumb.Item>

              </Breadcrumb>
              <div className="table-operations">
                <Table
                  rowKey={record => record.uid}
                  title={tableTitle}
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={this.state.dicom}
                  size="medium"
                  onChange={this.handleTableChange}
                  pagination={{ position: 'bottom', showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items` }}
                />
              </div>
            </div>
          ) : (
            <div>
              <Breadcrumb style={{ paddingTop: '.4rem' }}>
                <Breadcrumb.Item>INDUS DICOM EXPLORER</Breadcrumb.Item>
                <Breadcrumb.Item><a href="">Search</a></Breadcrumb.Item>
                <Breadcrumb.Item><a href="">Viewer: Scan {this.state.view}</a></Breadcrumb.Item>
              </Breadcrumb>
              <Viewer stack={{ ...stack }} />
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}

export default App;
