import { Component,OnInit, ViewChild, ElementRef,  } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { CookieService } from 'ngx-cookie';

import {Search} from './search';

declare var google: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  recentSearches: any = [];
  lat: number = 48.118146;
  lng: number = -123.43074130000002;
  selectedCity: string = "Port Angeles, WA, United States";
  currentWeather: boolean = true;
  @ViewChild("cityName") cityNameBox: ElementRef;
  constructor(
    private mapsLoader: MapsAPILoader,
    private cookieService: CookieService
  ){}

  ngOnInit()
  {
    this.mapsLoader.load().then(() => 
    {
      let autoComplete = new google.maps.places.Autocomplete(this.cityNameBox.nativeElement, {
        types:["(cities)"]
      });
      
      autoComplete.addListener("place_changed", () =>{
          let place = autoComplete.getPlace();
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.selectedCity = this.cityNameBox.nativeElement.value;
      });
       });


     this.loadRecentSearches();  
    }

    loadRecentSearches()
    {
      this.recentSearches = this.cookieService.getObject("searches");
      //recentSearches is now an array of search objects
      if(this.recentSearches == undefined)
      {
        this.recentSearches = [];
      }
      else
      {
        this.recentSearches.sort(this.compareSearchTerms);
      }

    }
    go()
    {
      console.log("appComponent" + this.lat +" " + this.lng);
      let found : boolean = false;
      // find name in searches list
      for(let s of this.recentSearches)
      {
        if(s.location == this.selectedCity)
        {
          s.numSearches++;
          found = true;
        }
      }
      //didn't find name in list so add it
      if(!found)
      {
        let temp = new Search()
        temp.location = this.selectedCity;
        temp.numSearches = 1;
        temp.latitude = this.lat;
        temp.longitude = this.lng;
        this.recentSearches.push(temp);
      }
      // sort by number of searches
      this.recentSearches.sort(this.compareSearchTerms);
      this.cookieService.remove("searches");
      this.cookieService.putObject("searches", this.recentSearches);

      //console.log(this.recentSearches);
      
    }


    loadRecentSearch(lat, lng, city)
    {
      this.lat = lat;
      this.lng = lng;
      this.selectedCity = city;

      this.go();

    }

    // used for sorting array of search objects
    compareSearchTerms(a,b)
    {
      if(a.numSearches > b.numSearches)
      {
        return -1;
      }
      else if( a.numSearches < b.numSearches)
      {
        return 1;
      }
      return 0;
    }

    showCurrentWeather()
    {
      this.currentWeather = true;
    }
    showHistoricData()
    {
      this.currentWeather = false;
    }


}

