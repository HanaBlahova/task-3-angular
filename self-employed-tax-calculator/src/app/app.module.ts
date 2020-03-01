import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TaxCalculationComponent } from './tax-calculation/tax-calculation.component';
import { CalculationHistoryComponent } from './calculation-history/calculation-history.component';
import { ReactiveFormsModule } from '@angular/forms';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeCS from '@angular/common/locales/cs';

registerLocaleData(localeCS);


@NgModule({
  declarations: [
    AppComponent,
    TaxCalculationComponent,
    CalculationHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'cs' },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
