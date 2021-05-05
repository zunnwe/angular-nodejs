import { Component, OnInit } from '@angular/core';
import {ProductService} from '../../services/product.service';
import {Router} from '@angular/router';
import {ProductServerModel, ServerResponse} from '../../models/product.model';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: ProductServerModel[]= [];

  constructor(private productSer: ProductService, private router: Router, private cartSer: CartService) {
  }

  ngOnInit(): void {
    this.productSer.getAllProducts().subscribe((prods: ServerResponse) => {
      this.products = prods.products;
    });
  }

  selectProduct(id: number): void{
    this.router.navigate(['/products', id]).then();
  }

  addToCart(id: number): void{
    this.cartSer.AddProductToCart(id);
  }
}
