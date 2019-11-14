import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { RestService } from '../shared/services/rest.service';
import { ConditionTable } from '../shared/models/condition-table.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'htr-calculators',
  template: `
    <div class="main-div">
      <mat-card class="z-depth center" flex="50">
        <mat-card-header>
          <h1>Konditionsrechner</h1>
        </mat-card-header>
        <form [formGroup]="calculatorForm" (ngSubmit)="calculate()">
          <mat-card-content fxLayout="column">
            <div fxLayout fxLayoutGap="5%">
              <mat-form-field fxFlex>
                <input matInput #postalCode required placeholder="Postleitzahl" minlength="2" maxlength="5" formControlName="postalCode" tabindex="1" onClick="this.setSelectionRange(0, this.value.length)">
                <mat-hint align="end">{{postalCode.value.length}} / 5</mat-hint>
                <mat-error *ngIf="calculatorForm.get('postalCode').errors && calculatorForm.get('postalCode').errors['required']">
                  Pflichtfeld
                </mat-error>
                <mat-error *ngIf="calculatorForm.get('postalCode').errors && calculatorForm.get('postalCode').errors['minlength']">
                  Mind. 2 Stellen
                </mat-error>
                <mat-error *ngIf="calculatorForm.get('postalCode').errors && calculatorForm.get('postalCode').errors['maxlength']">
                  Max. 5 Stellen
                </mat-error>
              </mat-form-field>
              <mat-form-field fxFlex>
                <input matInput required type="number" step="1" min="0" max="40001" placeholder="Gewicht" formControlName="weight" tabindex="2" onClick="this.setSelectionRange(0, this.value.length)">
                <span matSuffix>kg</span>
                <mat-error *ngIf="calculatorForm.get('weight').errors && calculatorForm.get('weight').errors['required']">
                  Pflichtfeld
                </mat-error>
                <mat-error *ngIf="calculatorForm.get('weight').errors && calculatorForm.get('weight').errors['max']">
                  Hat Ihr Containerschiff Räder?
                </mat-error>
                <mat-error *ngIf="calculatorForm.get('weight').errors && calculatorForm.get('weight').errors['min']">
                  Positiv denken
                </mat-error>
              </mat-form-field>
              </div>
              <mat-form-field>
                <input matInput type="number" placeholder="Lademeter" formControlName="lademeter" tabindex="3">
                <span matSuffix>m</span>
                <mat-error *ngIf="calculatorForm.get('lademeter').errors && calculatorForm.get('lademeter').errors['min']">
                  Positiv denken
                </mat-error>
                <mat-error *ngIf="calculatorForm.get('lademeter').errors && calculatorForm.get('lademeter').errors['max']">
                  Das ist nicht erlaubt
                </mat-error>
              </mat-form-field>
              
              <mat-form-field *ngFor="let calculator of calculators">
                <input matInput readonly [placeholder]="calculator.name" tabindex="-1" [id]="calculator.id" [value]="prices[calculator.id] | currency:'EUR'" (click)="copyToClipboard(calculator.id)">
                <mat-icon matSuffix>file_copy</mat-icon>
                <mat-error *ngIf="errors[calculator.id] == 'ZipCodeNotSupported'">
                  Postleitzahl nicht unterstützt
                </mat-error>
                <mat-error *ngIf="errors[calculator.id] === 'WeightTooHigh'"> 
                  Gewicht höher als Maximum
                </mat-error>
                <mat-error *ngIf="errors[calculator.id] === 'WeightTooLow'">
                  Gewicht kleiner als Minimum
                </mat-error>
              </mat-form-field>
          </mat-card-content>
          <mat-card-actions align="end">
            <button type="submit" [disabled]="!calculatorForm.valid" mat-button tabindex="6">
              Berechnen
            </button>
          </mat-card-actions>
        </form>
      </mat-card>
    </div>
  `,
  styleUrls: ['./calculators.component.scss']
})
export class CalculatorsComponent implements OnInit {

  calculatorForm: FormGroup;
  calculators: ConditionTable[];
  calculatorsLoading: boolean = true;
  prices: Array<{id: number, price: number}> = [];
  names: Array<{id: number, name: string}> = [];
  errors: Array<{id: number, error: string}> = [];

  get conditionTables() { 
    return this.calculatorForm.get('conditionTables') as FormArray;
  }

  constructor(private fb: FormBuilder, private restService: RestService, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.calculatorForm = this.fb.group({
      postalCode: ['0', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(5)])],
      lademeter: [null, Validators.compose([Validators.min(0), Validators.max(12)])],
      weight: [0, Validators.compose([Validators.min(0), Validators.max(40000), Validators.required])]
    });

    this.restService.listConditionTables().subscribe( (conditionTables: ConditionTable[]) => {
      this.calculators = conditionTables;

      this.calculators.forEach( calculator => {
        this.prices[calculator.id] = 0;
        this.names[calculator.id] = calculator.name;
        this.errors[calculator.id] = '';
      });
    });
  }

  clearForm() {
    this.calculatorForm.reset({weight: 0});
  }

  @ViewChild('postalCode', {static: true}) postalCodeElement: ElementRef;
  focusFirstFormInput() {
      this.postalCodeElement.nativeElement.focus();
  }

  copyToClipboard(calculatorId) {
    console.log(calculatorId);
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', ((Math.round(this.prices[calculatorId] * 100) /100).toLocaleString('de-DE')));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this._snackBar.open(`${this.names[calculatorId]}-Tariff kopiert`, 'OK', {
      duration: 2000,
    });
  }

  calculate() {
    // Fix me, asap
    var postalCode = this.calculatorForm.get('postalCode').value.substring(0, 2);
    var weight = this.calculatorForm.get('weight').value;
    var lademeter = this.calculatorForm.get('lademeter').value;

    this.calculators.forEach(calculator => {
      this.restService.calculate(calculator, postalCode, weight, lademeter).subscribe(((result: {price: number, error: string}) => {
        console.log(result);
        this.prices[calculator.id] = result.price;
        this.errors[calculator.id] = result.error;
        this.clearForm();
        this.focusFirstFormInput();
      }), _ => {
        this.prices[calculator.id] = 0;
      });
    });
  }
}
