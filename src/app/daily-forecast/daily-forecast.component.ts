import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import { Forecast } from '../forecast';
import  * as Moment from 'moment';
import { ForecastService } from './../forecast.service';
@Component({
  selector: 'app-daily-forecast',
  templateUrl: './daily-forecast.component.html',
  styleUrls: ['./daily-forecast.component.css']
})
export class DailyForecastComponent implements OnInit, OnChanges {

  @Input() lat: number;
  @Input() lng: number;
  @Input() selectedCity: string;
  forecast: boolean = true;
  data: Forecast;
  currentDate:any ;
  forecastData:any = [];

  // chart variables
  public labels = [];
  public hourlyPrecipData = [{data:[],label:"precip"}];
  public hourlyTempData = [{data:[], label:"temps"}];
  public hourlyhumidityData = [{data:[], label:"humid"}];
  public chartOptions= {responsive: true };
  public chartLegend:boolean = true;
  public chartType:string = 'bar';


  constructor
  (
    private forecastService: ForecastService
  ){}

  ngOnChanges(changes: SimpleChanges)
  {
    // console.log("LAT AND LNG UPDATES");
    this.forecastService.getCurrentAtPosition(this.lat,this.lng).then((someData) => this.updateCurrentDayInterface(someData) );
    this.forecastService.getCurrentAtPositionForecast(this.lat,this.lng).then((someData) => this.updateForecastInterface(someData));

  }

  ngOnInit() 
  {
  }

  updateCurrentDayInterface(data )
  {
    // deal with current day
    console.log("starting day interface");
    console.log(data);
    this.data = data.currentData as Forecast;
    this.currentDate =  Moment.unix(this.data.time).format("ddd, MMM D, YYYY");

   this.hourlyPrecipData = [{data:[],label:"Hourly Precipitation Probability"}];
   this.hourlyTempData = [{data:[], label:"Hourly Temperature"}];
   this.hourlyhumidityData = [{data:[], label:"Hourly Humidity"}];


    // build hourly labels and 
    this.labels = [];
    for(let i = 0; i < 24; i++)
    {
      let hour = data.hourlyData[i] as Forecast;
      let moment = Moment.unix(hour.time);
      this.hourlyhumidityData[0].data.push(hour.humidity);
      this.hourlyPrecipData[0].data.push(hour.precipProbability);
      this.hourlyTempData[0].data.push(hour.temperature);
      this.labels.push(moment.format('LT'));
    }
    console.log(this.labels);
  }

  updateForecastInterface(data)
  {
    // deal with forecast object
    //console.log(data);
    this.forecastData = [];
    for(let day of data)
    {
      // take each day and add it to the array
      let temp = {};
      temp["date"] = Moment.unix(day.time).format("ddd, MMM D");
      temp["data"] = day;
      this.forecastData.push(temp);
    }
  }

  showForecast()
  {
    this.forecast = true;

  }

  showHourly()
  {
    this.forecast = false;
  }
}
