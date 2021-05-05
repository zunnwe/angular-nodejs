import {ProductServerModel} from './product.model';

export interface CartModelServer{
  total: number;          // total amount or cash
  data: [{
    products: ProductServerModel,
    numInCart: number
  }];
}

export interface CartModelPublic{
  total: number;
  prodData: [{
    id: number;
    numInCart: number
  }];
}
