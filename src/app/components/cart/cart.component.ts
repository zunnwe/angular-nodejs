import { Component, OnInit } from '@angular/core';
import {CartModelServer} from '../../models/cart.model';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartData: CartModelServer;
  cartTotal: number;
  subTotal: number;

  constructor(private cartSer: CartService) { }

  ngOnInit(): void {
    this.cartSer.cartTotal$.subscribe(total => this.cartTotal = total);
    this.cartSer.cartData$.subscribe(data => this.cartData = data);
  }

  ChangeQuantity(index: number, increase: boolean): void{
    this.cartSer.UpdateCartItems(index, increase);
  }

}
