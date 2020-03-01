import { Component, OnInit } from '@angular/core';
import { CalculationService } from '../service/calculation-service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AllData } from '../model/all-data';


@Component({
  selector: 'app-tax-calculation',
  templateUrl: './tax-calculation.component.html',
  styleUrls: ['./tax-calculation.component.scss']
})
export class TaxCalculationComponent implements OnInit {

  constructor(private calculationService: CalculationService) {}

  // Declaration of variables
  expenses = ['Paušálem', 'Skutečné výdaje'];
  percentages = [0.3, 0.4, 0.6, 0.8];
  taxRate = 0.15;
  submitted = false;
  calcForm: FormGroup;

  calcData:AllData = {
    income: 0,
    expenseWay: '',
    expense: 0,
    taxBasis: 0,
    notBasisTotal: 0,
    taxBasisWithout: 0,
    roundedTaxBasisWithout: 0,
    taxAmount: 0,
    discountsTotal: 0,
    taxAfterDiscounts: 0,
    insuranceBasis: 0,
    socialInsurance: 0,
    healthInsurance: 0,
    contributionsTotal: 0,
    taxAfterDeposit: 0,
    netAnnualIncome: 0,
    netMonthIncome: 0,
    netAnnualIncomeAfterExpenses: 0,
    netMonthIncomeAfterExpenses: 0,
    saving: false
  }

  taxDiscounts = {
    taxpayer: 24840,
    partner: 24840,
    student: 335
  }

  insuranceRate = {
    social: 0.292,
    health: 0.135
  }

  limits = {
    percIncome: 2000000,
    tax: 0,
    pensLifeIns: 24000,
    schFees: 13350,
    socialBasis: 98100,
    healthBasis: 196200,
    maxInterest: 300000
  }
  
  resultsArr:AllData[] = [];
  resultsArrStore:AllData[] = [];
  resultsArrGet:AllData[] = [];


    ngOnInit() {
    this.calcForm = new FormGroup ({
      'inputsForm': new FormGroup ({
        'income': new FormControl(null, Validators.required),
        'expenseWay': new FormControl('Paušálem', Validators.required),
        'percentageSelect': new FormControl(this.percentages[2], Validators.required),
        'realExpensesAmount': new FormControl(0, Validators.required)
        }), 
      'notBasisForm': new FormGroup ({
        'donates': new FormControl(0, Validators.required),
        'pension': new FormControl(0, [Validators.required, Validators.max(this.limits.pensLifeIns)]),
        'lifeIns': new FormControl(0, [Validators.required, Validators.max(this.limits.pensLifeIns)]),
        'interest': new FormControl(0, [Validators.required, Validators.max(this.limits.maxInterest)])
      }),  
      'taxForm': new FormGroup ({
        'taxpayerDis': new FormControl({value: true, disabled: true}),
        'partnerDis': new FormControl(false),
        'studentDis': new FormControl(false),
        'studentMonths': new FormControl(0, [Validators.required, Validators.max(12)]),        
        'schoolFees': new FormControl(0, [Validators.required, Validators.max(this.limits.schFees)]),
        'deposit': new FormControl(0, Validators.required)
      }),
      'saving': new FormControl(false)
    });

  }

  
  ngAfterViewInit() {
    if(this.calculationService.loadData() !== null) {
      this.resultsArr = this.calculationService.resArr.getValue();
      this.resultsArrStore = this.calculationService.loadData();
      this.calculationService.resArrStore.next(this.resultsArrStore);
    }
  }


  // Submit function
  onSubmit() {
    this.submitted = true;

    // Subscription of current data
    this.calculationService.resArr.subscribe( c => {
      this.resultsArr = c;
      }
    );
    this.calculationService.resArrStore.subscribe( c => {
      this.resultsArrStore = c;
      }
    );
    
    // Updating calcutated and form data
    this.updateData();

    // Storing data
    this.calculationService.storeData(this.resultsArrStore);

    // Sending current data to BehaviorSubject
    this.calculationService.calculatedData.next(this.calcData);
    this.calculationService.resArr.next(this.resultsArr);
    this.calculationService.resArrStore.next(this.resultsArrStore);

  }

  // Updating calcutated and form data function
    updateData() {
    // Expenses
    this.calcExpenses();

    // Tax basis
    this.calcData.income = this.calcForm.value.inputsForm.income;
    this.calcData.taxBasis = this.suburbanite(this.calcData.income, this.calcData.expense);
    this.calcData.expenseWay = this.calcForm.value.inputsForm.expenseWay;

    // Adjusted tax basis
    this.calcData.notBasisTotal = this.summation(this.calcForm.value.notBasisForm.donates, this.calcForm.value.notBasisForm.pension, 
      this.calcForm.value.notBasisForm.lifeIns, this.calcForm.value.notBasisForm.interest);
    
    this.calcData.taxBasisWithout = this.suburbanite(this.calcData.taxBasis, this.calcData.notBasisTotal);
    this.calcData.roundedTaxBasisWithout = Math.floor(this.calcData.taxBasisWithout / 100) * 100;

    // Tax
    this.calcData.taxAmount = this.multiplication(this.calcData.roundedTaxBasisWithout, this.taxRate);
    this.calcData.discountsTotal = this.summation(this.taxDiscounts.taxpayer, 
      this.calcDiscounts(this.calcForm.value.taxForm.partnerDis, this.taxDiscounts.partner), 
      this.multiplication(this.calcDiscounts(this.calcForm.value.taxForm.studentDis, this.taxDiscounts.student),this.calcForm.value.taxForm.studentMonths),
      this.calcForm.value.taxForm.schoolFees);
    this.calcData.taxAfterDiscounts = this.editting(this.suburbanite(this.calcData.taxAmount, this.calcData.discountsTotal), this.limits.tax);
    
    // Social and health insurance
    this.calcData.insuranceBasis = this.multiplication(this.suburbanite(this.calcData.income, this.calcData.expense), 0.5);
    this.calcData.socialInsurance = Math.ceil(this.multiplication(this.editting(this.calcData.insuranceBasis, this.limits.socialBasis), this.insuranceRate.social));
    this.calcData.healthInsurance = Math.ceil(this.multiplication(this.editting(this.calcData.insuranceBasis, this.limits.healthBasis), this.insuranceRate.health));
    
    // Total contributions
    this.calcData.contributionsTotal = this.summation(this.calcData.taxAfterDiscounts, this.calcData.socialInsurance, this.calcData.healthInsurance, 0);
    this.calcData.taxAfterDeposit = this.suburbanite(this.calcData.taxAfterDiscounts, this.calcForm.value.taxForm.deposit);
    
    // Annual and month data
    this.calcData.netAnnualIncome = this.suburbanite(this.calcData.income, this.calcData.contributionsTotal);
    this.calcData.netMonthIncome = Math.round(this.calcData.netAnnualIncome/12);
    this.calcData.netAnnualIncomeAfterExpenses = this.suburbanite(this.calcData.netAnnualIncome, this.calcData.expense);
    this.calcData.netMonthIncomeAfterExpenses = Math.round(this.calcData.netAnnualIncomeAfterExpenses/12);

    // Saving property
    this.calcData.saving = this.calcForm.value.saving;
    
    // Storing data to arrays
    this.storringData();
    
  }

  // Auxiliary functions for calculation

  // Expenses calculation
  calcExpenses() {

    if(this.calcForm.value.inputsForm.expenseWay === 'Paušálem') {
      if(this.calcForm.value.inputsForm.income > 0) {
        this.calcData.expense = this.multiplication(this.calcForm.value.inputsForm.percentageSelect, this.calcForm.value.inputsForm.income);
      } else {
        this.calcData.expense = 0;
      }

    } else if (this.calcForm.value.inputsForm.expenseWay === 'Skutečné výdaje') {
      this.calcData.expense = this.calcForm.value.inputsForm.realExpensesAmount;
      
    } else {
      this.calcData.expense = 0;
    }


  }

  // Discounts calculation
  calcDiscounts(discount:boolean, disAmount:number) {
    if(discount) {
      return disAmount;
    } else {
      return 0;
    }
  }

  // Storing data to arrays function
  storringData() {
    const newObj = JSON.parse(JSON.stringify(this.calcData));
    this.resultsArr.unshift(newObj);

    if (this.calcForm.value.saving) {
      const newObj2 = JSON.parse(JSON.stringify(this.calcData));
      this.resultsArrStore.unshift(newObj2);
    } 
  }


  // Mathematical functions
  suburbanite(a:number, b:number) {
    return a - b;
  }

  summation(a:number, b:number, c:number, d:number) {
    return a + b + c + d;
  }

  multiplication (a:number, b:number) {
    return a * b;
  }

  // Set up minimum limit function
  editting(num: number, limit:number) {
    if(num < limit) {
      return limit;
    } else {
      return num;
    }
  }

  
  // Cleaning form function
  cleanForm() {
    this.calcForm.reset();

    this.calcForm.setValue({
      'inputsForm': {
        'income': null,
        'expenseWay': 'Paušálem',
        'percentageSelect': this.percentages[2],
        'realExpensesAmount': 0,
        }, 
      'notBasisForm': {
        'donates': 0,
        'pension': 0,
        'lifeIns': 0, 
        'interest': 0, 
      },  
      'taxForm':{
        'taxpayerDis': {value: true, disabled: true},
        'partnerDis': false,
        'studentDis': false,
        'studentMonths': 0,        
        'schoolFees': 0,
        'deposit': 0,
      },
      'saving': false
    })
  }

}
