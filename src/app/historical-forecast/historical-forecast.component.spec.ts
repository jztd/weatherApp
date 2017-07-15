import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalForecastComponent } from './historical-forecast.component';

describe('HistoricalForecastComponent', () => {
  let component: HistoricalForecastComponent;
  let fixture: ComponentFixture<HistoricalForecastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoricalForecastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
