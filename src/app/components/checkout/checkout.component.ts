import { Component, OnInit } from '@angular/core';
import {CartModelServer} from '../../models/cart.model';
import {Router} from '@angular/router';
import {CartService} from '../../services/cart.service';
import {OrderService} from '../../services/order.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  cartTotal: number;
  cartData: CartModelServer;
  constructor(private router: Router,
              private cartSer: CartService,
              private orderSer: OrderService,
              private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.cartSer.cartTotal$.subscribe(total => this.cartTotal = total);
    this.cartSer.cartData$.subscribe(data => this.cartData = data);
  }

  OnCheckout(): void{
    this.spinner.show().then(p => {
      this.cartSer.CheckoutFromCart(2);
    });
  }

}
