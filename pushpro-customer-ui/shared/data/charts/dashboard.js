import dynamic from 'next/dynamic';
import React, { Component } from 'react';
const ReactTotalcustomers = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactTotalrevenue = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactConversionratio = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactTotaldeals = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactRevenueanalytics = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactProfitearned = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactProfit = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactEarning = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoBTC = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoETH = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoDASH = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoStatistics = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptobitcoin = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoetherium = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptodash = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoripple = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoiota = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCryptoneo = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCandidatesdata = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactSubscriptions = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactTotalbalance = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactNFTStatistics = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactSalesoverview = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactSalevalue = dynamic(() => import('react-apexcharts'), { ssr: false });
const ReactCandidatesdatas = dynamic(() => import('react-apexcharts'), { ssr: false });

export class Candidatesdatas extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [32, 27, 25, 16],
      options: {

        // labels: ["My First Dataset"],
        chart: {
          events: {
            mounted: (chart) => {
              chart.windowResizeHandler();
            }
          },
          height: 240,
          type: 'donut'
        },
        dataLabels: {
          enabled: false,
        },

        legend: {
          show: false,
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'round',
          colors: ["#fff"],
          width: 0,
          dashArray: 0,
        },
        plotOptions: {

          pie: {
            expandOnClick: false,
            donut: {
              size: '85%',
              labels: {
                name: {
                  show: true,
                  fontSize: '20px',
                  color: '#495057',
                  offsetY: -4
                },
                value: {
                  show: true,
                  fontSize: '18px',
                  color: undefined,
                  offsetY: 8,
                  formatter: function (val) {
                    return val + "%";
                  }
                },
              }
            }
          }
        },
        colors: ["rgb(132, 90, 223)", "rgb(35, 183, 229)", "rgb(245, 184, 73)", "rgb(38, 191, 148)",],
      }

    };
  }

  render() {
    return (
      <div>
        <ReactCandidatesdatas options={this.state.options} series={this.state.series} type="donut" height={240} />
      </div>

    );
  }
}
export class Totalcustomers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [20, 14, 19, 10, 23, 20, 22, 9, 12]
      }],
      options: {
        colors: ["rgb(132, 90, 223)"],
        chart: {
          type: 'line',
          height: 40,
          width: 100,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
          }
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          // show: false,
          axisBorder: {
            show: false
          },
        },
        tooltip: {
          enabled: false,
        },
      }

    };
  }

  render() {
    return (
      <div>
        <ReactTotalcustomers options={this.state.options} series={this.state.series} type="line" height={40} width={100} />
      </div>

    );
  }
}
export class Totalrevenue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [20, 14, 20, 22, 9, 12, 19, 10, 25]
      }],
      options: {
        colors: ["rgb(35, 183, 229)"],
        chart: {
          type: 'line',
          height: 40,
          width: 100,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
          }
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        tooltip: {
          enabled: false,
        },
      }

    };
  }

  render() {
    return (
      <div>
        <ReactTotalrevenue options={this.state.options} series={this.state.series} type="line" height={40} width={100} />
      </div>

    );
  }
}
export class Conversionratio extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [20, 20, 22, 9, 14, 19, 10, 25, 12]
      }],
      options: {
        colors: ["rgb(38, 191, 148)"],
        chart: {
          type: 'line',
          height: 40,
          width: 100,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
          }
        },

        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        tooltip: {
          enabled: false,
        },
      }

    };
  }

  render() {
    return (
      <div>
        <ReactConversionratio options={this.state.options} series={this.state.series} type="line" height={40} width={100} />
      </div>

    );
  }
}
export class Totaldeals extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [20, 20, 22, 9, 12, 14, 19, 10, 25]
      }],
      options: {
        colors: ["rgb(245, 184, 73)"],
        chart: {
          type: 'line',
          height: 40,
          width: 100,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
          type: 'gradient',
          gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
          }
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          // show: false,
          axisBorder: {
            show: false
          },
        },
        tooltip: {
          enabled: false,
        },
      }

    };
  }

  render() {
    return (
      <div>
        <ReactTotaldeals options={this.state.options} series={this.state.series} type="line" height={40} width={100} />
      </div>

    );
  }
}
export class Revenueanalytics extends Component {
  constructor(props) {
      super(props);

      this.state = {
          series: [
              {
                  type: 'line',
                  name: 'Profit',
                  data: [
                      {
                          x: 'Jan',
                          y: 100
                      },
                      {
                          x: 'Feb',
                          y: 210
                      },
                      {
                          x: 'Mar',
                          y: 180
                      },
                      {
                          x: 'Apr',
                          y: 454
                      },
                      {
                          x: 'May',
                          y: 230
                      },
                      {
                          x: 'Jun',
                          y: 320
                      },
                      {
                          x: 'Jul',
                          y: 656
                      },
                      {
                          x: 'Aug',
                          y: 830
                      },
                      {
                          x: 'Sep',
                          y: 350
                      },
                      {
                          x: 'Oct',
                          y: 350
                      },
                      {
                          x: 'Nov',
                          y: 210
                      },
                      {
                          x: 'Dec',
                          y: 410
                      }
                  ]
              },
              {
                  type: 'line',
                  name: 'Revenue',
                  data: [
                      {
                          x: 'Jan',
                          y: 180
                      },
                      {
                          x: 'Feb',
                          y: 620
                      },
                      {
                          x: 'Mar',
                          y: 476
                      },
                      {
                          x: 'Apr',
                          y: 220
                      },
                      {
                          x: 'May',
                          y: 520
                      },
                      {
                          x: 'Jun',
                          y: 780
                      },
                      {
                          x: 'Jul',
                          y: 435
                      },
                      {
                          x: 'Aug',
                          y: 515
                      },
                      {
                          x: 'Sep',
                          y: 738
                      },
                      {
                          x: 'Oct',
                          y: 454
                      },
                      {
                          x: 'Nov',
                          y: 525
                      },
                      {
                          x: 'Dec',
                          y: 230
                      }
                  ]
              },
              {
                  type: 'area',
                  name: 'Sales',
                  data: [
                      {
                          x: 'Jan',
                          y: 200
                      },
                      {
                          x: 'Feb',
                          y: 530
                      },
                      {
                          x: 'Mar',
                          y: 110
                      },
                      {
                          x: 'Apr',
                          y: 130
                      },
                      {
                          x: 'May',
                          y: 480
                      },
                      {
                          x: 'Jun',
                          y: 520
                      },
                      {
                          x: 'Jul',
                          y: 780
                      },
                      {
                          x: 'Aug',
                          y: 435
                      },
                      {
                          x: 'Sep',
                          y: 475
                      },
                      {
                          x: 'Oct',
                          y: 738
                      },
                      {
                          x: 'Nov',
                          y: 454
                      },
                      {
                          x: 'Dec',
                          y: 480
                      }
                  ]
              }
          ],
          options: {
              chart: {
                  height: 350,
                  animations: {
                      speed: 500
                  },
                  dropShadow: {
                      enabled: true,
                      enabledOnSeries: undefined,
                      top: 8,
                      left: 0,
                      blur: 3,
                      color: '#000',
                      opacity: 0.1
                  },
                  events: {
                      mounted: (chart) => {
                        chart.windowResizeHandler();
                      }
                    },
              },
              colors: ["rgb(132, 90, 223)", "rgba(35, 183, 229, 0.85)", "rgba(119, 119, 142, 0.05)"],
              dataLabels: {
                  enabled: false
              },
              grid: {
                  borderColor: '#f1f1f1',
                  strokeDashArray: 3
              },
              stroke: {
                  curve: 'smooth',
                  width: [2, 2, 0],
                  dashArray: [0, 5, 0],
              },
              xaxis: {
                  axisTicks: {
                      show: false,
                  },
              },
              yaxis: {
                  labels: {
                      formatter: function (value) {
                          return "$" + value;
                      }
                  },
              },
              tooltip: {
                  y: [{
                      formatter: function (e) {
                          return void 0 !== e ? "$" + e.toFixed(0) : e;
                      }
                  }, {
                      formatter: function (e) {
                          return void 0 !== e ? "$" + e.toFixed(0) : e;
                      }
                  }, {
                      formatter: function (e) {
                          return void 0 !== e ? e.toFixed(0) : e;
                      }
                  }]
              },
              legend: {
                  show: true,
                  customLegendItems: ['Profit', 'Revenue', 'Sales'],
                  inverseOrder: true
              },
              title: {
                  text: 'Revenue Analytics with sales & profit (USD)',
                  align: 'left',
                  style: {
                      fontSize: '.8125rem',
                      fontWeight: 'semibold',
                      color: '#8c9097'
                  },
              },
              markers: {
                  hover: {
                      sizeOffset: 5
                  }
              }
          }

      };
  }

  render() {
      return (
          <div>
              <ReactRevenueanalytics options={this.state.options} series={this.state.series} type="line" height={350} />
          </div>

      );
  }
}
export class Profitearned extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Profit Earned',
        data: [44, 42, 57, 86, 58, 55, 70],
      }, {
        name: 'Total Sales',
        data: [34, 22, 37, 56, 21, 35, 60],
      }],
      options: {
        chart: {
          type: 'bar',
          height: 180,
          toolbar: {
            show: false,
          }
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 3
        },
        colors: ["rgb(132, 90, 223)", "#e4e7ed"],
        plotOptions: {
          bar: {
            colors: {
              ranges: [{
                from: -100,
                to: -46,
                color: '#ebeff5'
              }, {
                from: -45,
                to: 0,
                color: '#ebeff5'
              }]
            },
            columnWidth: '60%',
            borderRadius: 5,
          }
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: undefined,
        },
        legend: {
          show: false,
          position: 'top',
        },
        yaxis: {
          title: {
            style: {
              color: '#adb5be',
              fontSize: '13px',
              fontFamily: 'poppins, sans-serif',
              fontWeight: 600,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + "";
            }
          }
        },
        xaxis: {
          categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
          labels: {
            rotate: -90
          }
        }
      }

    };
  }

  render() {
    return (
      <div>
        <ReactProfitearned options={this.state.options} series={this.state.series} type="bar" height={180} />
      </div>

    );
  }
}
export class Profit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [48],
      options: {
        chart: {
          height: 127,
          width: 100,
          type: "radialBar",
        },
        colors: ["rgba(255,255,255,0.9)"],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: "55%",
              background: "#fff"
            },
            dataLabels: {
              name: {
                offsetY: -10,
                color: "#4b9bfa",
                fontSize: ".625rem",
                show: false
              },
              value: {
                offsetY: 5,
                color: "#4b9bfa",
                fontSize: ".875rem",
                show: true,
                fontWeight: 600
              }
            }
          }
        },
        stroke: {
          lineCap: "round"
        },
        labels: ["Status"]
      }

    };
  }

  render() {
    return (

      <div id="chart">
        <ReactProfit options={this.state.options} series={this.state.series} type="radialBar" width={100} height={127} />
      </div>
    );
  }
}
export class Earning extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Total Orders',
        data: [44, 42, 57, 86, 112, 55, 70, 43, 23, 54, 77, 34],
      }],
      options: {
        chart: {
          type: 'bar',
          height: 200
        },
        grid: {
          borderColor: '#f2f6f7',
        },
        colors: ["rgba(132, 90, 223, 0.3)", "rgba(132, 90, 223, 0.3)", "rgba(132, 90, 223, 0.3)", "rgba(132, 90, 223, 0.3)", "rgb(132, 90, 223)", "rgba(132, 90, 223, 0.3)", "#e4e7ed", "#e4e7ed", "#e4e7ed", "#e4e7ed", "#e4e7ed", "#e4e7ed"],
        plotOptions: {
          bar: {
            columnWidth: '25%',
            distributed: true,
            borderRadius: 7,
          }
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: false,
        },
        yaxis: {
          title: {
            style: {
              color: '#adb5be',
              fontSize: '12px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 500,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + "";
            }
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'sep', 'oct', 'nov', 'dec'],
          axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
          labels: {
            rotate: -90
          }
        }
      }

    };
  }

  render() {
    return (
      <div>
        <ReactEarning options={this.state.options} series={this.state.series} type="bar" height={200} />
      </div>

    );
  }
}
export class CryptoBTC extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [0, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46]
      }],
      options: {
        chart: {
          type: 'line',
          height: 40,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#26bf94'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoBTC options={this.state.options} series={this.state.series} type="line" height={40} width={120} />
      // </div>

    );
  }
}
export class CryptoETH extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [0, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46]
      }],
      options: {
        chart: {
          type: 'line',
          height: 40,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
        },

        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#26bf94'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoETH options={this.state.options} series={this.state.series} type="line" height={40} width={120} />
      // </div>

    );
  }
}
export class CryptoDASH extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [0, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46]
      }],
      options: {
        chart: {
          type: 'line',
          height: 40,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {

        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#e6533c'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoDASH options={this.state.options} series={this.state.series} type="line" height={40} width={120} />
      // </div>

    );
  }
}
export class CryptoStatistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        data: [{
          x: new Date(1538778600000),
          y: [6629.81, 6650.5, 6623.04, 6633.33]
        },
        {
          x: new Date(1538780400000),
          y: [6632.01, 6643.59, 6620, 6630.11]
        },
        {
          x: new Date(1538782200000),
          y: [6630.71, 6648.95, 6623.34, 6635.65]
        },
        {
          x: new Date(1538784000000),
          y: [6635.65, 6651, 6629.67, 6638.24]
        },
        {
          x: new Date(1538785800000),
          y: [6638.24, 6640, 6620, 6624.47]
        },
        {
          x: new Date(1538787600000),
          y: [6624.53, 6636.03, 6621.68, 6624.31]
        },
        {
          x: new Date(1538789400000),
          y: [6624.61, 6632.2, 6617, 6626.02]
        },
        {
          x: new Date(1538791200000),
          y: [6627, 6627.62, 6584.22, 6603.02]
        },
        {
          x: new Date(1538793000000),
          y: [6605, 6608.03, 6598.95, 6604.01]
        },
        {
          x: new Date(1538794800000),
          y: [6604.5, 6614.4, 6602.26, 6608.02]
        },
        {
          x: new Date(1538796600000),
          y: [6608.02, 6610.68, 6601.99, 6608.91]
        },
        {
          x: new Date(1538798400000),
          y: [6608.91, 6618.99, 6608.01, 6612]
        },
        {
          x: new Date(1538800200000),
          y: [6612, 6615.13, 6605.09, 6612]
        },
        {
          x: new Date(1538802000000),
          y: [6612, 6624.12, 6608.43, 6622.95]
        },
        {
          x: new Date(1538803800000),
          y: [6623.91, 6623.91, 6615, 6615.67]
        },
        {
          x: new Date(1538805600000),
          y: [6618.69, 6618.74, 6610, 6610.4]
        },
        {
          x: new Date(1538807400000),
          y: [6611, 6622.78, 6610.4, 6614.9]
        },
        {
          x: new Date(1538809200000),
          y: [6614.9, 6626.2, 6613.33, 6623.45]
        },
        {
          x: new Date(1538811000000),
          y: [6623.48, 6627, 6618.38, 6620.35]
        },
        {
          x: new Date(1538812800000),
          y: [6619.43, 6620.35, 6610.05, 6615.53]
        },
        {
          x: new Date(1538814600000),
          y: [6615.53, 6617.93, 6610, 6615.19]
        },
        {
          x: new Date(1538816400000),
          y: [6615.19, 6621.6, 6608.2, 6620]
        },
        {
          x: new Date(1538818200000),
          y: [6619.54, 6625.17, 6614.15, 6620]
        },
        {
          x: new Date(1538820000000),
          y: [6620.33, 6634.15, 6617.24, 6624.61]
        },
        {
          x: new Date(1538821800000),
          y: [6625.95, 6626, 6611.66, 6617.58]
        },
        {
          x: new Date(1538823600000),
          y: [6619, 6625.97, 6595.27, 6598.86]
        },
        {
          x: new Date(1538825400000),
          y: [6598.86, 6598.88, 6570, 6587.16]
        },
        {
          x: new Date(1538827200000),
          y: [6588.86, 6600, 6580, 6593.4]
        },
        {
          x: new Date(1538829000000),
          y: [6593.99, 6598.89, 6585, 6587.81]
        },
        {
          x: new Date(1538830800000),
          y: [6587.81, 6592.73, 6567.14, 6578]
        },
        {
          x: new Date(1538832600000),
          y: [6578.35, 6581.72, 6567.39, 6579]
        },
        {
          x: new Date(1538834400000),
          y: [6579.38, 6580.92, 6566.77, 6575.96]
        },
        {
          x: new Date(1538836200000),
          y: [6575.96, 6589, 6571.77, 6588.92]
        },
        {
          x: new Date(1538838000000),
          y: [6588.92, 6594, 6577.55, 6589.22]
        },
        {
          x: new Date(1538839800000),
          y: [6589.3, 6598.89, 6589.1, 6596.08]
        },
        {
          x: new Date(1538841600000),
          y: [6597.5, 6600, 6588.39, 6596.25]
        },
        {
          x: new Date(1538843400000),
          y: [6598.03, 6600, 6588.73, 6595.97]
        },
        {
          x: new Date(1538845200000),
          y: [6595.97, 6602.01, 6588.17, 6602]
        },
        {
          x: new Date(1538847000000),
          y: [6602, 6607, 6596.51, 6599.95]
        },
        {
          x: new Date(1538848800000),
          y: [6600.63, 6601.21, 6590.39, 6591.02]
        },
        {
          x: new Date(1538850600000),
          y: [6591.02, 6603.08, 6591, 6591]
        },
        {
          x: new Date(1538852400000),
          y: [6591, 6601.32, 6585, 6592]
        },
        {
          x: new Date(1538854200000),
          y: [6593.13, 6596.01, 6590, 6593.34]
        },
        {
          x: new Date(1538856000000),
          y: [6593.34, 6604.76, 6582.63, 6593.86]
        },
        {
          x: new Date(1538857800000),
          y: [6593.86, 6604.28, 6586.57, 6600.01]
        },
        {
          x: new Date(1538859600000),
          y: [6601.81, 6603.21, 6592.78, 6596.25]
        },
        {
          x: new Date(1538861400000),
          y: [6596.25, 6604.2, 6590, 6602.99]
        },
        {
          x: new Date(1538863200000),
          y: [6602.99, 6606, 6584.99, 6587.81]
        },
        {
          x: new Date(1538865000000),
          y: [6587.81, 6595, 6583.27, 6591.96]
        },
        {
          x: new Date(1538866800000),
          y: [6591.97, 6596.07, 6585, 6588.39]
        },
        {
          x: new Date(1538868600000),
          y: [6587.6, 6598.21, 6587.6, 6594.27]
        },
        {
          x: new Date(1538870400000),
          y: [6596.44, 6601, 6590, 6596.55]
        },
        {
          x: new Date(1538872200000),
          y: [6598.91, 6605, 6596.61, 6600.02]
        },
        {
          x: new Date(1538874000000),
          y: [6600.55, 6605, 6589.14, 6593.01]
        },
        {
          x: new Date(1538875800000),
          y: [6593.15, 6605, 6592, 6603.06]
        },
        {
          x: new Date(1538877600000),
          y: [6603.07, 6604.5, 6599.09, 6603.89]
        },
        {
          x: new Date(1538879400000),
          y: [6604.44, 6604.44, 6600, 6603.5]
        },
        {
          x: new Date(1538881200000),
          y: [6603.5, 6603.99, 6597.5, 6603.86]
        },
        {
          x: new Date(1538883000000),
          y: [6603.85, 6605, 6600, 6604.07]
        },
        {
          x: new Date(1538884800000),
          y: [6604.98, 6606, 6604.07, 6606]
        },
        ]
      }],
      options: {
        chart: {
          type: 'candlestick',
          // borderRadius: 20,
          height: 290,
          toolbar: {
            show: false,
          }
        },
        plotOptions: {
          candlestick: {
            colors: {
              upward: "rgb(132, 90, 223)",
              downward: "rgba(132, 90, 223, 0.2)"
            }
          }
        },
        title: {
          align: 'left'
        },
        grid: {
          borderColor: '#f2f6f7',
        },
        xaxis: {
          type: 'datetime',
          axisBorder: {
            show: false,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: false,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
        },
        yaxis: {
          tooltip: {
            enabled: true
          }
        }
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoStatistics options={this.state.options} series={this.state.series} type="candlestick" height={285} />
      // </div>

    );
  }
}
export class Cryptobitcoin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [0, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {

        },
        tooltip: {
          enabled: false,
        },

        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#26bf94'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptobitcoin options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Cryptoetherium extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [0, 45, 54, 38, 56, 24, 65, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46, 31, 37, 39, 62, 51, 35, 41]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
        },
        tooltip: {
          enabled: false,
        },

        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#e6533c'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoetherium options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Cryptodash extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      series: [{
        name: 'Value',
        data: [61, 27, 54, 43, 19, 46, 31, 37, 39, 0, 45, 54, 38, 56, 24, 65, 35, 27, 93, 53, 62, 51, 35, 41]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {

        },
        tooltip: {
          enabled: false,
        },

        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#26bf94'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptodash options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Cryptoripple extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [61, 27, 54, 43, 19, 56, 24, 65, 35, 27, 93, 53, 46, 31, 37, 39, 0, 45, 54, 38, 62, 51, 35, 41]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {

        },
        tooltip: {
          enabled: false,
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#26bf94'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoripple options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Cryptoiota extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [61, 27, 54, 37, 39, 0, 45, 54, 38, 62, 51, 35, 41, 43, 19, 56, 24, 65, 35, 27, 93, 53, 46, 31]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {
        },
        tooltip: {
          enabled: false,
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#e6533c'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoiota options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Cryptoneo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [62, 51, 35, 41, 43, 19, 56, 24, 65, 35, 27, 93, 53, 46, 31, 61, 27, 54, 37, 39, 0, 45, 54, 38]
      }],
      options: {
        chart: {
          type: 'line',
          height: 20,
          width: 120,
          sparkline: {
            enabled: true
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 0,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 1.5,
          dashArray: 0,
        },
        fill: {

        },
        tooltip: {
          enabled: false,
        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ['#e6533c'],
      }

    };
  }

  render() {
    return (
      // <div id="chart">
      <ReactCryptoneo options={this.state.options} series={this.state.series} type="line" height={20} width={120} />
      // </div>

    );
  }
}
export class Candidatesdata extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [1754, 1234],
      options: {

        labels: ["Female", "Male"],
        chart: {
          height: 250,
          type: 'donut'
        },
        dataLabels: {
          enabled: false,
        },

        legend: {
          show: false,
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'round',
          colors: ["#fff"],
          width: 0,
          dashArray: 0,
        },
        plotOptions: {

          pie: {
            expandOnClick: false,
            donut: {
              size: '80%',
              background: 'transparent',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '20px',
                  color: '#495057',
                  offsetY: -4
                },
                value: {
                  show: true,
                  fontSize: '18px',
                  color: undefined,
                  offsetY: 8,
                  formatter: function (val) {
                    return val + "%";
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Total',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#495057',
                }

              }
            }
          }
        },
        colors: ["rgb(132, 90, 223)", "#23b7e5"],
      }

    };
  }

  render() {
    return (
      <div>
        <ReactCandidatesdata options={this.state.options} series={this.state.series} type="donut" height={250} />
      </div>

    );
  }
}
export class Subscriptions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: "Basic",
        data: [75, 78, 38, 39, 38, 73, 73, 53, 53, 16, 16, 53]
      },
      {
        name: "Pro",
        data: [35, 35, 62, 63, 13, 13, 60, 60, 41, 41, 82, 82]
      }
      ],
      options: {

        chart: {
          toolbar: {
            show: false
          },
          height: 285,
          type: 'line',
          zoom: {
            enabled: false
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 5,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.15
          },
        },
        grid: {
          borderColor: '#f1f1f1',
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [2, 2],
          curve: ['smooth', 'smooth'],
          lineCap: 'butt',
          dashArray: [0, 0]
        },
        title: {
          text: undefined,
        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'center',
          fontWeight: 600,
          fontSize: '11px',
          tooltipHoverFormatter: function (val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '';
          },
          labels: {
            colors: '#74767c',
          },
          markers: {
            width: 7,
            height: 7,
            strokeWidth: 0,
            radius: 12,
            offsetX: 0,
            offsetY: 0
          },
        },
        markers: {
          discrete: [{
            seriesIndex: 0,
            dataPointIndex: 5,
            fillColor: '#305cfc',
            strokeColor: '#fff',
            size: 4,
            shape: "circle"
          },
          {
            seriesIndex: 0,
            dataPointIndex: 11,
            fillColor: '#305cfc',
            strokeColor: '#fff',
            size: 4,
            shape: "circle"
          },
          {
            seriesIndex: 1,
            dataPointIndex: 10,
            fillColor: '#23b7e5',
            strokeColor: '#fff',
            size: 4,
            shape: "circle"
          }, {
            seriesIndex: 1,
            dataPointIndex: 4,
            fillColor: '#23b7e5',
            strokeColor: '#fff',
            size: 4,
            shape: "circle"
          }],
          hover: {
            sizeOffset: 6
          }
        },
        yaxis: {
          title: {
            style: {
              color: '#adb5be',
              fontSize: '14px',
              fontFamily: 'poppins, sans-serif',
              fontWeight: 600,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + "";
            },
            show: true,
            style: {
              colors: "#8c9097",
              fontSize: '11px',
              fontWeight: 600,
              cssClass: 'apexcharts-xaxis-label',
            },
          }
        },
        xaxis: {
          categories: ['01 Jan', '02 Jan', '03 Jan', '04 Jan', '05 Jan', '06 Jan', '07 Jan', '08 Jan', '09 Jan',
            '10 Jan', '11 Jan', '12 Jan'
          ],
          axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
          labels: {
            rotate: -90,
            style: {
              colors: "#8c9097",
              fontSize: '11px',
              fontWeight: 600,
              cssClass: 'apexcharts-xaxis-label',
            },
          }
        },
        tooltip: {
          y: [
            {
              title: {
                formatter: function (val) {
                  return val;
                }
              }
            },
            {
              title: {
                formatter: function (val) {
                  return val;
                }
              }
            },
            {
              title: {
                formatter: function (val) {
                  return val;
                }
              }
            }
          ]
        },
        colors: ["rgb(132, 90, 223)", "#23b7e5"],
      }

    };
  }

  render() {
    return (
      <div>
        <ReactSubscriptions options={this.state.options} series={this.state.series} type="line" height={280} />
      </div>

    );
  }
}
export class Totalbalance extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Value',
        data: [20, 14, 19, 10, 25, 20, 22, 9, 12]
      }],
      options: {
        chart: {
          type: 'line',
          height: 40,
          sparkline: {
            enabled: true
          }
        },
        stroke: {
          show: true,
          curve: 'smooth',
          lineCap: 'butt',
          colors: undefined,
          width: 2.5,
          dashArray: 0,
        },
        fill: {

        },
        yaxis: {
          min: 0,
          show: false,
          axisBorder: {
            show: false
          },
        },
        xaxis: {
          axisBorder: {
            show: false
          },
        },
        colors: ["rgb(132, 90, 223)"],
      }

    };
  }

  render() {
    return (
      <div>
        <ReactTotalbalance options={this.state.options} series={this.state.series} type="line" height={40} />
      </div>

    );
  }
}
export class NFTStatistics extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: "Price",
        data: [20, 38, 38, 72, 55, 63, 43, 76, 55, 80, 40, 80]
      }, {
        name: "Volume",
        data: [85, 65, 75, 38, 85, 35, 62, 40, 40, 64, 50, 89]
      }],
      options: {
        chart: {
          height: 343,
          type: 'line',
          zoom: {
            enabled: false
          },
          dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 5,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
          },
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          position: "top",
          horizontalAlign: "center",
          offsetX: -15,
          fontWeight: "bold",
        },
        stroke: {
          curve: 'smooth',
          dashArray: [0, 5],
          width: 3,
        },
        grid: {
          borderColor: '#f2f6f7',
        },
        colors: ["rgb(132, 90, 223)", "rgba(132, 90, 223, 0.3)"],
        yaxis: {
          title: {
            text: 'Statistics',
            style: {
              color: '#adb5be',
              fontSize: '14px',
              fontFamily: 'poppins, sans-serif',
              fontWeight: 600,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + "";
            }
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
          labels: {
            rotate: -90
          }
        }
      }

    };
  }

  render() {
    return (
      <div>
        <ReactNFTStatistics options={this.state.options} series={this.state.series} type="line" height={320} />
      </div>

    );
  }
}
export class Salesoverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [{
        name: 'Sales',
        data: [44, 42, 57, 86, 58, 55, 70, 43, 23, 54, 77, 34],
      }, {
        name: 'OPEX Ratio',
        data: [74, 72, 87, 116, 88, 85, 100, 73, 53, 84, 107, 64],
      }, {
        name: 'General & Admin',
        data: [84, 82, 97, 126, 98, 95, 110, 83, 63, 94, 117, 74],
      }, {
        name: 'Marketing',
        data: [-34, -22, -37, -56, -21, -35, -60, -34, -56, -78, -89, -53],
      }],
      options: {
        chart: {
          stacked: true,
          type: 'bar',
          height: 325,
        },
        grid: {
          borderColor: '#f5f4f4',
          strokeDashArray: 5
        },
        colors: ["rgb(132, 90, 223)", "rgba(132, 90, 223, 0.6)", "rgba(132, 90, 223, 0.3)", "#ebeff5"],
        plotOptions: {
          bar: {
            colors: {
              ranges: [{
                from: -100,
                to: -46,
                color: '#ebeff5'
              }, {
                from: -45,
                to: 0,
                color: '#ebeff5'
              }]
            },
            columnWidth: '20%',
          }
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: true,
          position: 'top',
        },
        yaxis: {
          title: {
            text: 'Growth',
            style: {
              color: '#adb5be',
              fontSize: '14px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + "";
            }
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'sep', 'oct', 'nov', 'dec'],
          axisBorder: {
            show: false,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: false,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
          },
          labels: {
            rotate: -90
          }
        }
      }

    };
  }

  render() {
    return (
      <div>
        <ReactSalesoverview options={this.state.options} series={this.state.series} type="bar" height={325} />
      </div>

    );
  }
}
export class Salevalue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [60],
      options: {
        chart: {
          height: 225,
          type: "radialBar",
        },
        colors: ["rgb(132, 90, 223)"],
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: "70%",
              background: "#fff"
            },
            track: {
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                blur: 2,
                opacity: 0.15
              }
            },
            dataLabels: {
              name: {
                offsetY: -10,
                color: "#4b9bfa",
                fontSize: "16px",
                show: false
              },
              value: {
                color: "#4b9bfa",
                fontSize: "30px",
                show: true
              }
            }
          }
        },
        stroke: {
          lineCap: "round"
        },
        labels: ["Cart"]
      }

    };
  }

  render() {
    return (
      <div>
        <ReactSalevalue options={this.state.options} series={this.state.series} type="radialBar" height={225} />
      </div>

    );
  }
}
