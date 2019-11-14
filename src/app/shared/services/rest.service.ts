import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { ConditionTable } from '../models/condition-table.model';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private apiUrl: string;
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private httpClient: HttpClient) { 
    this.apiUrl = `${environment.api.protocol}://${environment.api.host}:${environment.api.port}${environment.api.path}`;
  }

  listConditionTables() {
    console.log(this.apiUrl);
    var route: string = `${this.apiUrl}api/conditiontables`;

    return this.httpClient.get<ConditionTable[]>(route, {headers: this.headers});
  }

  calculate(calculator: ConditionTable, postalCode: string, weight: number, lademeter?: number) {
    var route: string = `${this.apiUrl}api/conditiontables/${calculator.id}/evaluate`;

    console.log(`postalCode: ${postalCode}, weight: ${weight}, lademeter: ${lademeter}`);

    return this.httpClient.post(route, {variables: [
        {
          "key": "zip_code",
          "value": postalCode
        },
        {
          "key": "weight",
          "value": weight
        },
        {
          "key": "loading_meters",
          "value": lademeter
        }
      ]
    }, {headers: this.headers});
  }
}
