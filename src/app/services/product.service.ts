import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ProductServerModel, ServerResponse} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private serverUrl = environment.serverURL;
  // tslint:disable-next-line:no-shadowed-variable
  constructor(private http: HttpClient) { }

  getAllProducts(limitOfResults = 10): Observable<ServerResponse>{
    return this.http.get<ServerResponse>(this.serverUrl + '/products', {
      params: {
       limit: limitOfResults.toString()
      }
    });
  }

  getSingleProduct(id: number): Observable<ProductServerModel>{
    return this.http.get<ProductServerModel>(this.serverUrl + '/products/' + id);
  }

  getProductsFromCategory(categoryName: string): Observable<ProductServerModel[]>{
    return this.http.get<ProductServerModel[]>(this.serverUrl + '/products/category/' + categoryName);
  }
}
