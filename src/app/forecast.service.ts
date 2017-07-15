import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
//import { Forecast } from './forecast';

import {HistSearch} from './hist-search';
import {HistObject} from './hist-object';

import { Forecast } from './forecast';
import * as Moment from 'moment';
import  DarkSkyApi  from 'dark-sky-api';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class ForecastService {
private  dSky = new DarkSkyApi('ed8d3a40908c178895973ba99d131680');
private localStorage = window.localStorage;
constructor ( private http: Http ) 
{
}
	
  private handleError(error: any)
	{
		console.error("an error occured", error);
	}

  getCurrent(lat, lng) : Promise<Forecast>
  {
    return this.dSky.loadCurrent().then((response) => 
    {
      //console.log(response);

      //constructa forecast object
      let temp = new Forecast;

      temp.apparentTemperature = response.data.apparentTemperature;
      temp.dewPoint = response.data.dewPoint;
      temp.humidity = response.data.humidity;
      temp.precipProbability = response.data.precipProbability;
      temp.temperature = response.data.temperature;
      temp.time = response.data.time;
      temp.windDirection = response.data.windDirection;
      temp.windSpeed = response.data.windSpeed;

      return temp;
    
  
    }).catch(this.handleError);
  }

  getCurrentAtPosition(lat,lng): Promise<any>
  {
    //console.log("GET CURRENT AT POSITION "+lat + " "+ lng);
    let position = {latitude: lat, longitude: lng};
    //console.log(position.latitude + " " + position.longitude);

    return new Promise((resolve, reject) =>
    {
     this.dSky.position(position).loadItAll('daily,minutely,flags,alerts').then((response) => 
    {      
      let data = {};
      //console.log(response);

      //constructa forecast object
      let temp = new Forecast;

      temp.apparentTemperature = response.currently.apparentTemperature;
      temp.dewPoint = response.currently.dewPoint;
      temp.humidity = response.currently.humidity;
      temp.precipProbability = response.currently.precipProbability;
      temp.temperature = response.currently.temperature;
      temp.time = response.currently.time;
      temp.windDirection = response.currently.windDirection;
      temp.windSpeed = response.currently.windSpeed;
      temp.summary = response.currently.summary;
      data["currentData"] = temp;

      // get hourly data in a nice to read format
      let hourlyData = [];
      for(let hour of response.hourly.data)
      {
        let hourForcast = new Forecast();
        hourForcast.time = hour.time;
        hourForcast.precipProbability = hour.precipProbability;
        hourForcast.temperature = hour.temperature;
        hourForcast.humidity = hour.humidity;
        hourlyData.push(hourForcast);
      }

      data["hourlyData"] = hourlyData;
      resolve(data);
    }).catch(this.handleError);
  });

  }

  getCurrentAtPositionForecast(lat,lng): Promise<Forecast[]>
  {
    let position = {latitude: lat, longitude: lng};
    return new Promise((resolve, reject) =>{
    this.dSky.loadForecast(position).then((response) =>
    {
      //console.log(response);
      let forecastData = [];
      //constructa forecast object
      for(let day of response.daily.data)
        {
        let temp = new Forecast;

        temp.apparentTemperature = day.apparentTemperature;
        temp.dewPoint = day.dewPoint;
        temp.humidity = day.humidity;
        temp.precipProbability = day.precipProbability;
        temp.temperature = day.temperature;
        temp.time = day.time;
        temp.windDirection = day.windDirection;
        temp.windSpeed = day.windSpeed;
        temp.summary = day.summary;
        temp.temperatureMax = day.temperatureMax;
        temp.temperatureMin = day.temperatureMin
        forecastData.push(temp);
      }
      resolve(forecastData);
    });
    });
  }

  getHistoricalAtPositionYear(lat,lng, cityName): Promise<HistSearch>
  {
    if(typeof(Storage) !== 'undefined' )
    {
      // we can access localstorage
      // see if what we are looking for exists
      if( localStorage.getItem(cityName) !== null)
      {
        // we have data
        console.log("getting cahced data");
        return this.retrieveStoredDate(lat,lng,cityName);
      }
      else
      {
        // we need to retreive data;
        return this.retrieveNewData(lat,lng,cityName);
      }
    }
    else
    {
      // we will have to make calls to the api
    }
  }

  getHistoricalAtPositionDay(lat,lng, date): Promise<HistObject>
  {
    return new Promise((resolve,reject) =>
    {
      try
      {
      let moment = Moment.unix(date);
      this.dSky.position({latitude:lat,longitude:lng});
      
      this.dSky.loadTime(moment).then((response) =>
      {
        
        //console.log(response);
        let temp = new HistObject;
        temp.date = response.daily.data[0].time;
        temp.dewPoint = response.daily.data[0].dewPoint;
        temp.highTemp = response.daily.data[0].temperatureMax;
        temp.lowTemp = response.daily.data[0].temperatureMin;
        temp.humidity = response.daily.data[0].humidity;
        temp.precipitationAmount = response.daily.data[0].precipAccumulation;
        temp.summary = response.daily.data[0].summary;
        resolve(temp);
      });

    }
    catch(err)
    {
      console.log(err);
      resolve({});
    }
    });
  }

  private retrieveStoredDate(lat,lng,cityName): Promise<HistSearch>
  {
    return new Promise( (resolve, reject) =>
    {
      //retrive data from storage and store it in a hist search object
      let data = JSON.parse(localStorage.getItem(cityName)) as HistSearch;
      let promises = [];
      //find last date 
      let lastMoment = Moment.unix(data.data[data.data.length - 1].date);
     // console.log(lastMoment);
      let currentMoment = Moment();
      let daysStale = currentMoment.diff(lastMoment,'days');

      let newData = [];
      //check if we need more data
      console.log("checking if data is stale");
      if(daysStale > 2)
      {
        console.log("daysStale:" +daysStale);
        // we need more data 
        for(let i = 0; i < daysStale - 2; i++ )
        {
          console.log("in the loop");
          // get data and add it to the data array
          try
          {
            lastMoment.add(1,'days');
            promises.push(this.dSky.position({latitude:lat,longitude:lng}).loadTime(lastMoment).then( (response) => 
            {
              //console.log(response);
              let temp = new HistObject();
              temp.date = response.daily.time;
              temp.dewPoint = response.daily.dewPoint;
              temp.summary = response.daily.summary;
              temp.highTemp = response.daily.temperatureMax;
              temp.lowTemp = response.daily.temperatureMin;
              temp.humidity = response.daily.humidity;
              //temp.precipitationAmount = response.daily.data[0].precipAccumulation;

              newData.push(temp);
            }).catch(this.handleError));
        }
        catch(err)
        {
          
          console.log(err);
        }
      }
    }

        // wait for all the calls to finish
        console.log("about to wait for all promises to complete");
        console.log(promises);
        Promise.all(promises).then(() => 
        {
            // sort the array store it in the old data then overwrite it in the local storage and return all the data together
            newData.sort(this.sortHistObjects);
            
            //add all the data to the old object
            for(let x of newData)
            {
              data.data.push(x);
            }

            // remove localstorage item update the time and rewrite it
            data.accessDate = currentMoment.unix();
            this.localStorage.removeItem(cityName);
            this.localStorage.setItem(cityName,JSON.stringify(data));
            console.log("returning local data after save");
            resolve(data);
        });
      

    });
  }

  private retrieveNewData(lat,lng,cityName): Promise<HistSearch>
  {
    console.log("Getting new data")
    return new Promise((resolve,reject) =>
    {
    let position = {latitude: lat, longitude: lng};
    let promises = [];
    let histObjects: HistObject[] = [];
    let histSearchObject: HistSearch;
    let currentMoment = Moment();
    let yearCounter = Moment();
    yearCounter.subtract(1,'years');

    let daysDifference = currentMoment.diff(yearCounter, 'days');    

   // we need a years worth of data...lets start with a month and work with it there and then we can do the rest
    for(let i = 0; i < daysDifference - 2; i++)
    {
      try{
      promises.push(
        this.dSky.position(position).loadTime(yearCounter).then((response) =>{
          let temp = new HistObject();
          temp.date = response.daily.data[0].time;
          temp.dewPoint = response.daily.data[0].dewPoint;
          temp.summary = response.daily.data[0].summary;
          temp.highTemp = response.daily.data[0].temperatureMax;
          temp.lowTemp = response.daily.data[0].temperatureMin;
          temp.humidity = response.daily.data[0].humidity;
          temp.precipitationAmount = response.daily.data[0].precipAccumulation;
          histObjects.push(temp);

        }).catch(this.handleError)
      );
    }
    catch(err)
    {
      console.log(err);
    }
      yearCounter.add(1, 'days');
    }
    
    Promise.all(promises).then(()=>
    {
      histObjects.sort(this.sortHistObjects);
      histSearchObject = new HistSearch();
      histSearchObject.accessDate = currentMoment.unix();
      histSearchObject.cityName = cityName;
      histSearchObject.latitude = lat;
      histSearchObject.longitude = lng;
      histSearchObject.data = histObjects;
      this.localStorage.setItem(cityName, JSON.stringify(histSearchObject));
      console.log("returning data");
      console.log(histSearchObject);
      resolve(histSearchObject);
    });
    
    });
  }
  private sortHistObjects(a,b)
  {
    if(a.date > b.date)
    {
      return 1;
    }
    else if(a.date < b.date)
    {
      return -1;
    }
    return 0;
  }

}
