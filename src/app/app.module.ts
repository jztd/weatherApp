import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CookieModule } from 'ngx-cookie';
import { AgmCoreModule } from '@agm/core';
import { AppComponent } from './app.component';
import { ChartsModule } from 'ng2-charts';

import { ForecastService } from './forecast.service';
import { DailyForecastComponent } from './daily-forecast/daily-forecast.component';
import { HistoricalForecastComponent } from './historical-forecast/historical-forecast.component';

@NgModule({
  declarations: [
    AppComponent,
    DailyForecastComponent,
    HistoricalForecastComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDD0N-SWi8jPLqRnAKo8utSu2HKP3KwvoI",
      libraries: ["places"]
    }),
    CookieModule.forRoot(),
    ChartsModule
  ],
  providers: [ForecastService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
