import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AllData } from '../model/all-data';


@Injectable({
    providedIn: 'root',
  })

export class CalculationService {

    calculatedData: BehaviorSubject<AllData>;
    resArr: BehaviorSubject<Array<AllData>>;
    resArrStore: BehaviorSubject<Array<AllData>>;

    constructor() {
        this.calculatedData = new BehaviorSubject(null);
        this.resArr = new BehaviorSubject([]);
        this.resArrStore = new BehaviorSubject([]);
        
        // Loading data from storage
        const loadArr = this.loadData();
        if(loadArr !== null) {
            this.resArr.next(loadArr);
            this.resArrStore.next(loadArr);
        }

    }

    //Storing data function
     storeData(data: Array<AllData>) {
        if (typeof(Storage) !== "undefined") {
            window.localStorage.setItem('result', JSON.stringify(data));
    
        } else {
            alert("No web storage support!")
        }

     }

     // Loading data function
     loadData () {
        return JSON.parse(window.localStorage.getItem('result'));
     }


     // Deleting functions
     deleteHistory() {
        window.localStorage.clear();
      }

     
     deleteItem(obj:AllData) {
        const arr: any[] = this.resArr.getValue();
        let arr2 = [];

        // Updating array with all objects
        let index = arr.indexOf(obj);
        arr.splice(index, 1);
        this.resArr.next(arr);

        // Updating array with stored objects
        arr2 = arr.filter(obj => {
            if(obj.saving) {
                return obj;
            }
        });
        this.resArrStore.next(arr2);


        // Local storage updating
        window.localStorage.clear();
        this.storeData(arr2);

     }
 
}