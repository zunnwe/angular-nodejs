import { Injectable } from '@angular/core';
import {CartModelPublic, CartModelServer} from '../models/cart.model';
import {environment} from '../../environments/environment';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {OrderService} from './order.service';
import {ProductService} from './product.service';
import {NavigationExtras, Router} from '@angular/router';
import {ProductServerModel} from '../models/product.model';
import {NgxSpinnerService} from 'ngx-spinner';
import {ToastrService} from 'ngx-toastr';
import localizeExtractLoader from '@angular-devkit/build-angular/src/extract-i18n/ivy-extract-loader';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private serverUrl = environment.serverURL;

  private productDataServer: CartModelServer = {
    total: 0,
    data: [{
      products: undefined,
      numInCart: 0
    }]
  };

  private productDataClient: CartModelPublic = {
    total: 0,
    prodData: [{
      numInCart: 0,
      id: 0
    }]
  };
  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<CartModelServer>(this.productDataServer);

  constructor(private http: HttpClient,
              private orderSer: OrderService,
              private productSer: ProductService,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toast: ToastrService
  ) {
    this.cartTotal$.next(this.productDataServer.total);
    this.cartData$.next(this.productDataServer);
    const info: CartModelPublic = JSON.parse(localStorage.getItem('cart')); // set any name as key
    if (info !== null && info !== undefined && info.prodData[0].numInCart !== 0) {
      //  Local Storage is not empty and has some information
      this.productDataClient = info;
      this.productDataClient.prodData.forEach(p => {
        this.productSer.getSingleProduct(p.id).subscribe((actualData: ProductServerModel) => {
          if (this.productDataServer.data[0].numInCart === 0) {
            this.productDataServer.data[0].numInCart = p.numInCart;
            this.productDataServer.data[0].products = actualData;
            this.CalculateTotal();
            this.productDataClient.total = this.productDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.productDataClient));
          } else {
            this.productDataServer.data.push({
              numInCart: p.numInCart,
              products: actualData
            });
            this.CalculateTotal();
            this.productDataClient.total = this.productDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.productDataClient));
          }
          this.cartData$.next({...this.productDataServer});
        });
      });
    }
  }

  AddProductToCart(id: number, quantity?: number): void {
    this.productSer.getSingleProduct(id).subscribe(prod => {
      //  1. If the cart is empty
      if (this.productDataServer.data[0].products === undefined) {
        this.productDataServer.data[0].products = prod;
        this.productDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;
        this.CalculateTotal();
        this.productDataClient.prodData[0].numInCart = this.productDataServer.data[0].numInCart;
        this.productDataClient.prodData[0].id = prod.id;
        this.productDataClient.total = this.productDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.productDataClient));
        this.cartData$.next({...this.productDataServer});
        this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });

      } else {
        const index = this.productDataServer.data.findIndex(p => p.products.id === prod.id);  // -1 or a positive value

        //     a. if that item is already in the cart  =>  index is positive value
        if (index !== -1) {
          if (quantity !== undefined && quantity <= prod.quantity) {
            this.productDataServer.data[index].numInCart =
              this.productDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;
          } else {
            // tslint:disable-next-line:no-unused-expression
            this.productDataServer.data[index].numInCart < prod.quantity ? this.productDataServer.data[index].numInCart++ : prod.quantity;
          }

          this.productDataClient.prodData[index].numInCart = this.productDataServer.data[index].numInCart;
          this.CalculateTotal();
          this.productDataClient.total = this.productDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.productDataClient));
          this.toast.info(`${prod.name} quantity updated in the cart`, 'Product Updated', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });

        }
        // IF product is not in the cart array

        else {
          this.productDataServer.data.push({
            numInCart: 1,
            products: prod
          });

          this.productDataClient.prodData.push({
            numInCart: 1,
            id: prod.id
          });
          this.toast.success(`${prod.name} added to the cart`, 'Product Added', {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          });

          this.CalculateTotal();
          this.productDataClient.total = this.productDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.productDataClient));
          this.cartData$.next({...this.productDataServer});
        }  // END OF ELSE
      }
    });
  }


  UpdateCart(index: number, increase: boolean): void{
    const data = this.productDataServer.data[index];
    if (increase) {
      // if the numInCart is less than product.quantity
      data.numInCart < data.products.quantity ? data.numInCart++ : data.products.quantity;
      this.productDataClient.prodData[index].numInCart = data.numInCart;
      this.CalculateTotal();
      this.productDataClient.total = this.productDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.productDataClient));
    }
    // if the numInCart is not less than product.quantity
    else {
      data.numInCart--;
      if (data.numInCart < 1){
        this.DeleteProductFromCart(index);
        this.cartData$.next({...this.productDataServer});
      }
      else{
        this.cartData$.next({...this.productDataServer});
        this.productDataClient.prodData[index].numInCart = data.numInCart;
        this.CalculateTotal();
        this.productDataClient.total = this.productDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.productDataClient));
      }
    }
  }

  DeleteProductFromCart(index: number): void{
    if (window.confirm('Are you sure you want to remove the item from cart?')){
      this.productDataServer.data.splice(index, 1);
      this.productDataClient.prodData.splice(index, 1);
      this.CalculateTotal();
      this.productDataClient.total = this.productDataServer.total;
      if (this.productDataServer.total === 0){
        this.productDataServer = { total: 0,
          data: [{
            products: undefined,
            numInCart: 0
          }]
        };
        this.cartData$.next({...this.productDataServer});
      }
      else {
        this.cartData$.next({...this.productDataServer});
      }
      if (this.productDataClient.total === 0){
        this.productDataClient = {total: 0,
          prodData: [{
            id: 0,
            numInCart: 0
          }]
        };
        localStorage.setItem('cart', JSON.stringify(this.productDataServer));
      }
      else {
        localStorage.setItem('cart', JSON.stringify(this.productDataServer));
      }
    }
    else {
      return;
    }
  }

  CheckoutFromCart(userId: number): void {
    this.http.post(`${this.serverUrl}/orders/payment`, null).subscribe((res: { success: boolean }) => {
      if (res.success) {

        this.ResetServerTable();
        this.http.post(`${this.serverUrl}/orders/new`, {
          userId,
          products: this.productDataClient.prodData
        }).subscribe((data: OrderResponse) => {
          this.orderSer.getSingleOrder(data.order_id).then(prods => {
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.order_id,
                  total: this.productDataClient.total
                }
              };

              this.spinner.hide().then();
              this.router.navigate(['/thankyou'], navigationExtras).then(p => {
                this.productDataClient = {total: 0, prodData: [{numInCart: 0, id: 0}]};
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.productDataClient));
              });
            }
          });
        });
      } else {
        this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Sorry, failed to book the order`, 'Order Status', {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        });
      }
    });
  }

  private CalculateTotal(): void{
    let total = 0;
    this.productDataServer.data.forEach( p => {
      const {numInCart} = p;      // es6 destructuring
      const {price} = p.products;     // es6 destructuring
      total += numInCart * price;
    });
    this.productDataServer.total = total;
    this.cartTotal$.next(this.productDataServer.total);
  }

  CalculateSubTotal(index: number): number{
    let subTotal = 0;
    const p = this.productDataServer.data[index];
    subTotal = p.products.price * p.numInCart;
    return subTotal;
  }

  private ResetServerTable(): void {
    this.productDataServer = {total: 0,
      data: [{
        products: undefined,
        numInCart: 0
      }]
    };
    this.cartData$.next({...this.productDataServer});
  }
}

interface OrderResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [{
    id: number,
    numInCart: number
  }];
}
