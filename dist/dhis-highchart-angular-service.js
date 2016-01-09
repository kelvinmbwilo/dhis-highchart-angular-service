(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('dhisHighchartAngularService.config', [])
      .value('dhisHighchartAngularService.config', {
          debug: true
      });

  // Modules
  angular.module('dhisHighchartAngularService.directives', []);
  angular.module('dhisHighchartAngularService.filters', []);
  angular.module('dhisHighchartAngularService.services', ['chartServices']);
  angular.module('dhisHighchartAngularService',
      [
          'dhisHighchartAngularService.config',
          'dhisHighchartAngularService.directives',
          'dhisHighchartAngularService.filters',
          'dhisHighchartAngularService.services',
          'ngResource',
          'ngCookies',
          'ngSanitize'
      ]);

})(angular);

/**
 * Created by kelvin on 1/9/16.
 */
/*jslint maxlen: 130 */
var chartServices = angular.module('chartServices',['ngResource']);

chartServices.factory('chartsManager',function(){
  'use strict';

  var chartsManager = {
    data: '',
    defaultChartObject: {
      title: {
        text: ''
      },
      xAxis: {
        categories: [],
        labels:{
          rotation: -90,
          style:{ 'color': '#000000', 'fontWeight': 'normal' }
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        },labels:{
          style:{ 'color': '#000000', 'fontWeight': 'bold' }
        }
      },
      labels: {
        items: [{
          html: '',
          style: {
            left: '50px',
            top: '18px'
            //color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
          }
        }]
      },
      series: []
    },
    //determine the position of metadata using prefix [dx,de,co,pe,ou]
    getTitleIndex: function(analyticsObjectHeaders,name){
      var index = 0;
      var counter = 0;
      angular.forEach(analyticsObjectHeaders,function(header){
        if(header.name === name){
          index = counter;
        }
        counter++;
      });
      return index;
    },

    //determine the position of data value,(Expected to be the last one)
    getValueIndex: function(analyticsObjectHeaders){
      var counter = -1;
      angular.forEach(analyticsObjectHeaders,function(header){
        counter++;
      });
      return counter;
    },

    //get an array of items from analyticsObject[metadataType == dx,co,ou,pe,value]
    getMetadataArray : function (analyticsObject,metadataType) {
      //determine the position of metadata in rows of values
      var index = this.getTitleIndex(analyticsObject.headers,metadataType);
      var metadataArray = [];
      var checkArr = [];
      if(metadataType === 'dx' || metadataType === 'value'){
        angular.forEach(analyticsObject.rows,function(value){
          if(checkArr.indexOf(value[index]) === -1){
            metadataArray.push(value[index]);
            checkArr.push(value[index]);
          }
        });
      }else if(metadataType === 'ou'){
        metadataArray = analyticsObject.metaData.ou;
      }else if(metadataType === 'co'){
        metadataArray = analyticsObject.metaData.co;
      }else if(metadataType === 'pe'){
        metadataArray = analyticsObject.metaData.pe;
      }else{
        metadataArray = analyticsObject.metaData.co;
      }

      return metadataArray;
    },

    //preparing categories depending on selections
    //return the meaningfull array of xAxis and yAxis Items
    prepareCategories : function(analyticsObject,xAxis,yAxis){
      var structure = {'xAxisItems':[],'yAxisItems':[]};
      angular.forEach(this.getMetadataArray(analyticsObject,yAxis),function(val){
        structure.yAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
      });
      angular.forEach(this.getMetadataArray(analyticsObject,xAxis),function(val){
        structure.xAxisItems.push({'name':analyticsObject.metaData.names[val],'uid':val});
      });
      return structure;

    },

    //try to find data from the rows of analytics object
    getDataValue : function(analyticsObject,xAxisType,xAxisUid,yAxisType,yAxisUid,filterType,filterUid){
      var num = 0;
      var currentService = this;
      $.each(analyticsObject.rows,function(key,value){
        if(filterType === 'none'){
          if(value[currentService.getTitleIndex(analyticsObject.headers,yAxisType)] === yAxisUid &&
            value[currentService.getTitleIndex(analyticsObject.headers,xAxisType)] === xAxisUid ){
            num = parseFloat(value[currentService.getTitleIndex(analyticsObject.headers,'value')]);
          }
        }else{
          if(value[currentService.getTitleIndex(analyticsObject.headers,yAxisType)] === yAxisUid &&
            value[currentService.getTitleIndex(analyticsObject.headers,xAxisType)] === xAxisUid &&
            value[currentService.getTitleIndex(analyticsObject.headers,filterType)] === filterUid ){
            num = parseFloat(value[currentService.getTitleIndex(analyticsObject.headers,'value')]);
          }
        }

      });
      return num;
    },

    //drawing some charts
    drawChart : function(type){

    },

    //hacks for pie chart
    drawPieChart : function(analyticsObject,xAxisType,yAxisType,filterType,filterUid,title){
      var chartObject = angular.copy(this.defaultChartObject);
      chartObject.title.text = title;
      //chartObject.yAxis.title.text = title.toLowerCase();
      var pieSeries = [];
      var metaDataObject = this.prepareCategories(analyticsObject,xAxisType,yAxisType);
      var currentService = this;
      angular.forEach(metaDataObject.yAxisItems,function(yAxis){
        angular.forEach(metaDataObject.xAxisItems,function(xAxis){
          var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
          pieSeries.push({name: yAxis.name+' - '+ xAxis.name , y: parseFloat(number)});
        });
      });

      chartObject.series = {type: 'pie', name:title , data: pieSeries,showInLegend: true,
        dataLabels: {
          enabled: false
        }
      };
      return chartObject;
    },

    //hack for combined charts
    drawCombinedChart : function(analyticsObject,xAxisType,yAxisType,filterType,filterUid,title){
      var chartObject = angular.copy(this.defaultChartObject);
      chartObject.title.text = title;
      //chartObject.yAxis.title.text = title.toLowerCase();
      var pieSeries = [];
      var metaDataObject = this.prepareCategories(analyticsObject,xAxisType,yAxisType);
      var currentService = this;
      angular.forEach(metaDataObject.yAxisItems,function(yAxis){
        var barSeries = [];
        angular.forEach(metaDataObject.xAxisItems,function(xAxis){
          var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
          barSeries.push(parseFloat(number));
          pieSeries.push({name: yAxis.name+' - '+ xAxis.name , y: parseFloat(number) });
        });
        chartObject.series.push({type: 'column', name: yAxis.name, data: barSeries});
        chartObject.series.push({type: 'spline', name: yAxis.name, data: barSeries});
      });
      chartObject.series.push({type: 'pie', name: title, data: pieSeries,center: [100, 80],size: 150,showInLegend: false,
        dataLabels: {
          enabled: false
        }
      });

      return chartObject;
    },

    //draw all other types of chart[bar,line,area]
    drawOtherCharts : function(analyticsObject,xAxisType,yAxisType,filterType,filterUid,title,chartType){
      var chartObject = angular.copy(this.defaultChartObject);
      chartObject.title.text = title;
      var metaDataObject = this.prepareCategories(analyticsObject,xAxisType,yAxisType);
      var currentService = this;
      angular.forEach(metaDataObject.yAxisItems,function(yAxis){
        var chartSeries = [];
        angular.forEach(metaDataObject.xAxisItems,function(xAxis){
          var number = currentService.getDataValue(analyticsObject,xAxisType,xAxis.uid,yAxisType,yAxis.uid,filterType,filterUid);
          chartSeries.push(parseFloat(number));
        });
        chartObject.series.push({type: chartType, name: yAxis.name, data: chartSeries});
      });
      return chartObject;
    }


  };
  return chartsManager;
});
