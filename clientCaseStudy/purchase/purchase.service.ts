import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Purchase } from '@app/purchase/purchase';
import { GenericHttpService } from '@app/generic-http.service';
@Injectable({
  providedIn: 'root',
})
export class PurchaseService extends GenericHttpService<Purchase> {
  constructor(httpClient: HttpClient) {
    super(httpClient, `purchases`);
  }
}
