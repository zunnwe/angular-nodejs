import { Component, OnInit } from '@angular/core';
import {CartModelServer} from '../../models/cart.model';
import {CartService} from '../../services/cart.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  cartData: CartModelServer;
  cartTotal: number;
  authState: boolean;

  constructor(private cartSer: CartService, private userSer: UserService) { }

  ngOnInit(): void {
    this.cartSer.cartTotal$.subscribe(total => this.cartTotal = total);
    this.cartSer.cartData$.subscribe(data => this.cartData = data);
    this.userSer.authState$.subscribe(authState => this.authState = authState);
  }

}
