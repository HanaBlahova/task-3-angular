import { Component, OnInit } from '@angular/core';
import { CalculationService } from '../service/calculation-service';
import { AllData } from '../model/all-data';


@Component({
  selector: 'app-calculation-history',
  templateUrl: './calculation-history.component.html',
  styleUrls: ['./calculation-history.component.scss']
})
export class CalculationHistoryComponent implements OnInit {

  data:AllData;
  arr:AllData[]  = [];
  arrStore:AllData[]  = [];

  constructor(private calculationService: CalculationService) {}

  ngOnInit() {

    // Subscriptions
    this.calculationService.resArr.subscribe( c => {
      this.arr = c;
      }
    );

    this.calculationService.resArrStore.subscribe( c => {
      this.arrStore = c;
      }
    );

  }

 // Deleting functions 
  delHistory() {
    this.calculationService.deleteHistory();
    this.arr = [];
    this.arrStore = [];
    this.calculationService.resArr.next(this.arr);
    this.calculationService.resArrStore.next(this.arrStore);
  }


  delItem(obj:AllData) {
    this.calculationService.deleteItem(obj);
    this.calculationService.storeData(this.arrStore);
  }

}
