import { Component, OnInit } from '@angular/core';
import {CartService} from '../../services/cart.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.css']
})
export class ThankyouComponent implements OnInit {

  messages: string;
  orderId: number;
  product;
  cartTotal;
  constructor(private cartSer: CartService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state as{
      message: string;
      products: ProductResponseModel[];
      orderId: number;
      total: number
    };
    this.messages = state.message ? state.message : null;
    this.orderId = state.orderId;
    this.product = state.products;
    this.cartTotal = state.total;
    console.log(this.product);
  }

  ngOnInit(): void {
  }

}

interface ProductResponseModel{
  id: number;
  title: string;
  description: string;
  price: number;
  quantityOrdered: number;
  image: string;
}
