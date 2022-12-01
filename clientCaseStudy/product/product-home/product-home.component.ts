
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product } from '@app/product/product';
import { Vendor } from '@app/vendor/vendor';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductService } from '@app/product/product.service';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  //selector: 'app-product',
  templateUrl: './product-home.component.html',
})
export class ProductHomeComponent implements OnInit, AfterViewInit {
  // Observables
  vendors$?: Observable<Vendor[]>;
  products: Product[];
  products$?: Observable<Product[]>;
  productDataSource$?: Observable<MatTableDataSource<Product>>; // for MatTable
  // misc.
  product: Product;
  hideEditForm: boolean;
  msg: string;
  todo: string;
  size: number = 0;
  // MatPaginator
  length = 0;
  pageSize = 5;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'vendorid'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>();
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private vendorService: VendorService,
    private productService: ProductService
  ) {
    this.hideEditForm = true;
    this.products = [];
    this.product = {
      id: '',
      vendorid: 0,
      name: '',
      costprice: 0,
      msrp: 0,
      rop: 0,
      eoq: 0,
      qoh: 0,
      qoo: 0,
      qrcode: '',
      qrcodetxt: '',
    };
    this.msg = '';
    this.todo = '';
    this.sort = new MatSort();
  } // constructor
  ngOnInit(): void {
    (this.productDataSource$ = this.productService.get().pipe(
      map((products) => {
        const dataSource = new MatTableDataSource<Product>(products);
        this.dataSource.data = products;
        this.dataSource.sort = this.sort;
        if (this.paginator !== undefined) {
          this.dataSource.paginator = this.paginator;
        }

        return dataSource;
      })
    )),
      catchError((err) => (this.msg = err.message));
  } // ngOnInit
  ngAfterViewInit(): void {
    (this.vendors$ = this.vendorService.get()),
      catchError((err) => (this.msg = err.message));
    (this.products$ = this.productService.get()),
      catchError((err) => (this.msg = err.message));
  } // ngAfterInit

  select(selectedProduct: Product): void {
    //this.todo = 'update';
    this.product = selectedProduct;
    this.msg = `Product ${selectedProduct.id} selected`;
    this.hideEditForm = !this.hideEditForm;
  } // select
  /**
  * cancelled - event handler for cancel button
  */
  cancel(msg?: string): void {
    this.hideEditForm = !this.hideEditForm;
    this.msg = 'Operation cancelled';
  } // cancel
  /**
  * update - send changed update to service update local array
  */
  update(selectedProduct: Product): void {
    this.msg = 'Updating...';
    this.productService.update(selectedProduct).subscribe({
      // observer object
      next: (prod: Product) => (this.msg = `Product ${prod.id} updated!`),
      error: (err: Error) => (this.msg = `Update failed! - ${err.message}`),
      complete: () => {
        this.hideEditForm = !this.hideEditForm;
      },
    });
  } // update
  /**
  * save - determine whether we're doing and add or an update
  */
  save(product: Product): void {
    const result = this.dataSource.data.find(it => it.id === product.id)
    result ? this.update(product) : this.add(product);
  } // save

  add(newProduct: Product): void {
    this.msg = 'Adding product...';
    // newProduct.id = '';
    this.productService.add(newProduct).subscribe({
      // observer object
      next: (prod: Product) => {
        this.msg = `Product ${prod.id} added!`;
      },
      error: (err: Error) => (this.msg = `Product not added! - ${err.message}`),
      complete: () => {
        this.hideEditForm = !this.hideEditForm;
      },
    });
  } // add
  /**
  * delete - send expense id to service for deletion
  */
  delete(selectedProduct: Product): void {
    this.msg = 'Deleting...';
    this.productService.deleteProduct(selectedProduct.id).subscribe({
      // observer object
      next: (numOfProductDeleted: string) => {
        numOfProductDeleted != null
          ? (this.msg = `Product ${selectedProduct.id} deleted!`)
          : (this.msg = `Product ${selectedProduct.id} not deleted!`);
      },
      error: (err: Error) => (this.msg = `Delete failed! - ${err.message}`),
      complete: () => {
        this.hideEditForm = !this.hideEditForm;
      },
    });
  } // delete
  /**
  * newExpense - create new expense instance
  */
  newProduct(): void {
    this.product = {
      id: '',
      vendorid: 0,
      name: '',
      costprice: 0,
      msrp: 0,
      rop: 0,
      eoq: 0,
      qoh: 0,
      qoo: 0,
      qrcode: '',
      qrcodetxt: '',
    };
    this.msg = 'New product';
    this.hideEditForm = !this.hideEditForm;
  } // newExpense
  sortProductsWithObjectLiterals(sort: Sort): void {
    const literals = {
      // sort on id
      id: () =>
      (this.dataSource.data = this.dataSource.data.sort(
        (a: Product, b: Product) =>
          sort.direction === 'asc'
            ? a.id < b.id
              ? -1
              : 1
            : b.id < a.id // descending
              ? -1
              : 1// descending
      )),
      // sort on employeeid
      vendorid: () =>
      (this.dataSource.data = this.dataSource.data.sort(
        (a: Product, b: Product) =>
          sort.direction === 'asc'
            ? a.vendorid - b.vendorid
            : b.vendorid - a.vendorid // descending
      )),
      // sort on dateincurred
      name: () =>
      (this.dataSource.data = this.dataSource.data.sort(
        (a: Product, b: Product) =>
          sort.direction === 'asc'
            ? a.name < b.name
              ? -1
              : 1
            : b.name < a.name // descending
              ? -1
              : 1
      )),
    };
    literals[sort.active as keyof typeof literals]();
  } // sortProducsWithObjectLiterals
} // ProducHomeComponent