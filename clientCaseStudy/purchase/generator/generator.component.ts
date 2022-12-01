import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Vendor } from '@app/vendor/vendor';
import { Product } from '@app/product/product';
import { PurchaseItem } from '@app/purchase/purchase-item';
import { Purchase } from '@app/purchase/purchase';
import { PDFURL } from '@app/constants';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductService } from '@app/product/product.service';
import { PurchaseService } from '@app/purchase/purchase.service';
@Component({
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  productid: FormControl;
  quantityid: FormControl;
  formSubscription?: Subscription;
  products$?: Observable<Product[]>; // everybody's expenses
  vendors$?: Observable<Vendor[]>; // all vendors
  vendorproducts$?: Observable<Product[]>; // all expenses for a particular vendor
  quantities$?: Observable<PurchaseItem[]>; // all quantites for a particular product
  items: Array<PurchaseItem>; // product items that will be in report
  units: Array<PurchaseItem>; // number of product quantity in the report
  selectedproducts: Product[]; // products that being displayed currently in app
  selectedProduct: Product; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
  selectedQuantity: Product; // the current selected quantity for the products
  selectedquantites: Product[]; // quantities being displayed currently in app
  pickedProduct: boolean;
  pickedVendor: boolean;
  generated: boolean;
  hasProducts: boolean;
  msg: string;
  sub: number;
  tax: number;
  total: number;
  poreportno: number;
  //reportno: number = 0;
  hidePricingFields: boolean;
  constructor(
    private builder: FormBuilder,
    private vendorService: VendorService,
    private productService: ProductService,
    private purchaseService: PurchaseService
  ) {
    this.msg = '';
    this.sub = 0;
    this.tax = 0;
    this.total = 0;
    this.poreportno = 0;
    this.pickedVendor = false;
    this.pickedProduct = false;
    this.generated = false;
    this.hasProducts = false;
    this.hidePricingFields = true;
    this.vendorid = new FormControl('');
    this.productid = new FormControl('');
    this.quantityid = new FormControl('');
    this.generatorForm = this.builder.group({
      vendorid: this.vendorid,
      productid: this.productid,
      quantityid: this.quantityid,
    });
    this.selectedProduct = {
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
      //doesExist: false,

    };
    this.selectedVendor = {
      id: 0,
      name: '',
      address1: '',
      city: '',
      province: '',
      postalcode: '',
      phone: '',
      type: '',
      email: '',
    };
    this.selectedQuantity = {
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
      //doesExist: false,

    };
    this.items = new Array<PurchaseItem>();
    this.units = new Array<PurchaseItem>();
    this.selectedproducts = new Array<Product>();
    this.selectedquantites = new Array<Product>();
  } // constructor
  ngOnInit(): void {
    this.msg = '';
    this.vendorid = new FormControl('');
    this.productid = new FormControl('');
    this.quantityid = new FormControl('');
    this.generatorForm = this.builder.group({
      vendorid: this.vendorid,
      productid: this.productid,
      quantityid: this.quantityid,
    });
    this.onPickVendor();
    this.onPickProduct();
    this.onPickQuantity();
    this.msg = 'loading vendors and products from server...';
    this.vendors$ = this.vendorService.get().pipe(
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.msg = `Error: ${error.error.message}`;
        } else {
          this.msg = `Error: ${error.message}`;
        }
        return of([]); // returns an empty array if there's a problem
      })
    );
    this.products$ = this.productService.get().pipe(
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          this.msg = `Error: ${error.error.message}`;
        } else {
          this.msg = `Error: ${error.message}`;
        }
        return of([]);
      })
    );
    this.msg = 'Vendors and Products loaded';
  } // ngOnInit
  ngOnDestroy(): void {
    if (this.formSubscription !== undefined) {
      this.formSubscription.unsubscribe();
    }
  } // ngOnDestroy

  /**
   * onPickVendor - Another way to use Observables, subscribe to the select change event
   * then load specific vendor products for subsequent selection
   */
  onPickVendor(): void {
    this.formSubscription = this.generatorForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = {
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
          //doesExist: false,

        };
        this.selectedQuantity = {
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
          // doesExist: false,

        };
        this.selectedVendor = val;
        this.loadVendorProducts();
        this.pickedProduct = false;
        this.hasProducts = false;
        this.msg = 'choose product for vendor';
        this.pickedVendor = true;
        this.generated = false;
        this.items = []; // array for the report
        this.selectedproducts = []; // array for the details in app html products
        this.selectedquantites = []; // array for the details in app html quantity
      });
  } // onPickVendor
  /**
   * onPickProduct - subscribe to the select change event then
   * update array containing items.
   */
  onPickProduct(): void {
    const xSubscr = this.generatorForm
      .get('productid')
      ?.valueChanges.subscribe((val) => {
        this.selectedProduct = val;

        this.pickedProduct = true;
        //this.generatorForm.patchValue({ quantityid: this.selectedProduct.eoq }); // default eoq value
        this.generatorForm.get('quantityid')?.setValue(this.selectedProduct.eoq);
        this.generatorForm.get('qty')?.setValue('');

        const item: PurchaseItem = {
          name: this.selectedProduct.name,
          id: 0,
          price: this.selectedProduct.msrp,
          productid: this.selectedProduct.id,
          po: 0,
          qty: this.selectedProduct.eoq,
        };

        if (this.items.find((it) => it.productid === this.selectedProduct.id)) {
        } else {
          this.items.push(item);
          this.selectedproducts.push(this.selectedProduct);
        }
      });
    this.formSubscription?.add(xSubscr); // add it as a child, so all can be destroyed together
  } // onPickProduct
  /**
   * onPickQuantity - subscribe to the select change event then
   * update array containing items.
   */
  onPickQuantity(): void {
    const xSubscr = this.generatorForm
      .get('quantityid')
      ?.valueChanges.subscribe((val) => {
        if (val === 'eoq') {
          val = this.selectedProduct.eoq;
          this.items.pop();
        } else {
          val = this.quantityid.value
        }
        const found = this.items.find(
          (x) => x.productid === this.selectedProduct.id
        );
        const item: PurchaseItem = {
          name: this.selectedProduct.name,
          id: 0,
          price: this.selectedProduct.costprice,
          productid: this.selectedProduct.id,
          po: 0,
          qty: val,
        };
        if (this.items.find((it) => item.productid === it.productid)) {
          // ignore entry
        }
        if (val === '0') {
          const idx = this.items.findIndex(
            (it) => it.productid === this.selectedProduct.id
          );
          if (idx !== -1) {
            this.items.splice(idx, 1);
          }
          this.msg = `All ${this.selectedProduct.name}s removed!`;
        } else if (found && found.qty !== val) {
          const updateItem = this.items.findIndex(
            (it) => it.productid === this.selectedProduct.id
          );
          this.items[updateItem].qty = val;
          this.msg = `${item.qty} ${this.selectedProduct.name} added`;
        } else {
          // add entry
          this.items.push(item);
          this.selectedproducts.push(this.selectedProduct);
          this.msg = `${item.qty} ${this.selectedProduct.name} added`;
        }
        if (this.items.length > 0) {
          this.hasProducts = true;
        }
        this.sub = 0.0;
        this.tax = 0.0;
        this.total = 0.0;
        this.items.forEach((sub) => (this.sub += sub.qty * sub.price));
        this.items.forEach((tax) => (this.tax += tax.qty * tax.price * 0.13));
        this.items.forEach(
          (total) => (this.total += total.qty * total.price * 1.13)
        );

      });

    this.formSubscription?.add(xSubscr); // add it as a child, so all can be destroyed together

  } // onPickQuantity

  /**
   * loadVendorProducts - filter for a  vendor's products
   */
  loadVendorProducts(): void {
    this.vendorproducts$ = this.products$?.pipe(
      map((products) =>
        // map each product in the array and check whether or not it belongs to selected vendor
        products.filter(
          (product) => product.vendorid === this.selectedVendor.id
        )
      )
    );
  } // loadVendorProducts
  /**
   * createReport - create the client side report
   */
  createReport(): void {
    this.generated = false;
    const report: Purchase = {
      id: 0,
      items: this.items,
      amount: this.total,
      vendorid: this.selectedProduct.vendorid,
      podate: '',
    };
    this.purchaseService.add(report).subscribe({
      next: (report: Purchase) => {
        // server should be returning new id
        report.id > 0
          ? (this.msg = `PO ${report.id} added!`)
          : (this.msg = 'PO not added! - server error');
        this.poreportno = report.id;
      },
      error: (err: Error) => (this.msg = `PO not added! - ${err.message}`),
      complete: () => {
        this.generated = true;
        this.hasProducts = false;
        this.pickedVendor = false;
        this.pickedProduct = false;
        this.hidePricingFields = false;
      },
    });
  } // createReport
  viewPdf(): void {
    window.open(`${PDFURL}${this.poreportno}`, '');
  } // viewPdf
}