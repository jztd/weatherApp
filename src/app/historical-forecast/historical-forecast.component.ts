import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import {ForecastService } from '../forecast.service';

import { HistSearch } from '../hist-search';
import{ HistObject } from '../hist-object';

import {ChartsModule} from 'ng2-charts';

import  * as Moment from 'moment';

@Component({
  selector: 'app-historical-forecast',
  templateUrl: './historical-forecast.component.html',
  styleUrls: ['./historical-forecast.component.css']
})
export class HistoricalForecastComponent implements OnInit, OnChanges {
  @Input() lat: number;
  @Input() lng: number;
  @Input() selectedCity: string;

  public dayDate: string;
  public dayObject: HistObject;
  public dateSelected: boolean = false;
  public averageHighTemperatureData = [{data:[],label:"highTemp"}];
  public averageLowTemperatureData = [{data:[],label:"lowTemp"}];
  public averageHumidityData = [{data:[],label:"humidity"}];
  public averageDewPointData = [{data:[], label:"dewpoint"}];
  public averagePrecipitationData = [{data:[], label:"precipitation"}];
  public monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','December'];
    
  public chartOptions= {responsive: true };
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
  constructor( private forecastService: ForecastService) { }

  ngOnInit() 
  {
  }

  ngOnChanges(changes: SimpleChanges)
  {
    console.log("CHANGES dEected");
      this.dateSelected = false;
      this.forecastService.getHistoricalAtPositionYear(this.lat,this.lng,this.selectedCity).then((response) => this.updateChartInterface(response as HistSearch));
  }
  updateChartInterface(data:HistSearch)
  {
    // clear all the data
    console.log("updating Chart Interface");
    this.averageHighTemperatureData = [{data:[],label:'Average High Temperature'}];
    this.averageLowTemperatureData = [{data:[], label:'Average Low Temperature'}];
    this.averageHumidityData = [{data:[], label:'Average Humidity'}];
    this.averageDewPointData = [{data:[], label:'Average Dew Point Temperature'}];
    this.averagePrecipitationData = [{data:[], label:'Average Precipitation in Inches'}];

    let monthDaysCounts = {};
    let averageHighTemperatureDataPoints = {};
    let averageLowTemperatureDataPoints = {};
    let averageHumidityDataPoints = {};
    let averageDewPointDataPoints = {};
    let averagePrecipitationDataPoints = {}; // todo

    for(let day of data.data)
    {
      let moment = Moment.unix(day.date);
      console.log("month number is: "+moment.month().toString());
      
      // count the days
      if(moment.month().toString() in monthDaysCounts)
      {
        monthDaysCounts[moment.month().toString()]++;
      }
      else
      {
        monthDaysCounts[moment.month().toString()] = 1;
      }

      if(moment.month().toString() in averageDewPointDataPoints)
      {
        averageDewPointDataPoints[moment.month().toString()] += day.dewPoint;
      }
      else
      {
        averageDewPointDataPoints[moment.month().toString()] = day.dewPoint;
      }

      if(moment.month().toString() in averageHighTemperatureDataPoints)
      {
        averageHighTemperatureDataPoints[moment.month().toString()] += day.highTemp;
      }
      else
      {
        averageHighTemperatureDataPoints[moment.month().toString()] = day.highTemp;
      }

      if(moment.month().toString() in averageLowTemperatureDataPoints)
      {
        averageLowTemperatureDataPoints[moment.month().toString()] += day.lowTemp;
      }
      else
      {
        averageLowTemperatureDataPoints[moment.month().toString()] = day.lowTemp;
      }

      if(moment.month().toString() in averageHumidityDataPoints)
      {
        averageHumidityDataPoints[moment.month().toString()] += day.humidity;
      }
      else
      {
        averageHumidityDataPoints[moment.month().toString()] = day.humidity;
      }

      // ADD PRECIPITATION AMOUNT


    }

    // calculate averages for each month
    for(let i =0;i<12;i++)
    {
      if(i.toString() in monthDaysCounts)
      {
        this.averageDewPointData[0].data.push( averageDewPointDataPoints[i.toString()] / monthDaysCounts[i.toString()]);
        this.averageHighTemperatureData[0].data.push(averageHighTemperatureDataPoints[i.toString()] / monthDaysCounts[i.toString()]);
        this.averageLowTemperatureData[0].data.push(averageLowTemperatureDataPoints[i.toString()] / monthDaysCounts[i.toString()]);
        this.averageHumidityData[0].data.push(averageHumidityDataPoints[i.toString()] / monthDaysCounts[i.toString()]);
        // TODO PRECIPITATION
      }
      else
      {
        this.averageDewPointData[0].data.push( 0);
        this.averageHighTemperatureData[0].data.push(0);
        this.averageLowTemperatureData[0].data.push(0);
        this.averageHumidityData[0].data.push(0);
      }
    }

    console.log(this.averageHighTemperatureData);
    console.log(monthDaysCounts);
    
  }

  updateSingleDayInterface(data:HistObject)
  {
    this.dayObject = data; 
    this.dateSelected = true;

  }

  selectDate(date)
  {
    let moment = Moment(date, "YYYY-MM-DD");
    this.dayDate = moment.format("ddd, MMM D, YYYY");
    console.log("trying to get data from the past");
    this.forecastService.getHistoricalAtPositionDay(this.lat,this.lng,moment.unix()).then((response) => 
    {
      console.log("we got data from the past");
      this.updateSingleDayInterface(response);

    
  });

  }

}
