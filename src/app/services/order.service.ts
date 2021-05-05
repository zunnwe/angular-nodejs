import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private products: ProductResponseModel[];
  private serverUrl = environment.serverURL;

  constructor(private http: HttpClient) { }

  getSingleOrder(orderId: number): Promise<any>{
    return this.http.get<ProductResponseModel[]>(this.serverUrl + '/orders' + orderId).toPromise();
  }
}

interface ProductResponseModel{
  id: number;
  title: string;
  description: string;
  quantityOrdered: number;
  price: number;
  image: string;
}
