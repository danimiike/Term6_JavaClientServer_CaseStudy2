import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendor } from '../../vendor/vendor';
import { PurchaseItem } from '../purchase-item';
import { Purchase } from '../purchase';
import { BASEURL, PDFURL } from '@app/constants';
import { VendorService } from '../../vendor/vendor.service';
import { PurchaseService } from '../purchase.service';
import { Product } from '@app/product/product';
import { ProductService } from '@app/product/product.service';
@Component({
  templateUrl: './viewer.component.html',
})
export class ViewerComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  poid: FormControl;
  subscription?: Subscription;
  vendors$?: Observable<Vendor[]>; // all vendors
  vendorpos$?: Observable<Purchase[]>; // all expenses for a particular vendor
  products$?: Observable<Product[]>; // all quantites for a particular product
  items: Array<PurchaseItem>; // product items that will be in report
  purchaseorders: Array<Purchase> = [];
  selectedproducts: Array<Product> = [];
  selectedPO: Purchase; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
  pickedPO: boolean;
  pickedVendor: boolean;
  hasPOs: boolean;
  hidePricingFields: boolean;
  msg: string;
  url: string;
  sub: number;
  tax: number;
  total: number;
  constructor(
    private builder: FormBuilder,
    private vendorService: VendorService,
    private purchaseOrderService: PurchaseService,
    private productService: ProductService
  ) {
    this.msg = '';
    this.sub = 0;
    this.tax = 0;
    this.total = 0;
    this.pickedVendor = false;
    this.pickedPO = false;
    this.hasPOs = false;
    this.url = BASEURL + 'pos';
    this.vendorid = new FormControl('');
    this.poid = new FormControl('');
    this.generatorForm = this.builder.group({
      vendorid: this.vendorid,
      poid: this.poid,
    });
    this.selectedPO = {
      id: 0,
      vendorid: 0,
      items: [],
      amount: 0,
      podate: '',
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
    this.hidePricingFields = true;
    this.items = new Array<PurchaseItem>();
  } // constructor
  ngOnInit(): void {
    this.msg = '';
    this.vendorid = new FormControl('');
    this.poid = new FormControl('');
    this.generatorForm = this.builder.group({
      vendorid: this.vendorid,
      poid: this.poid,
    });
    this.onPickVendor();
    this.onPickedPO();
    this.msg = 'loading vendors and POs from server...';
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
        return of([]); // returns an empty array if there's a problem
      })
    );
    this.msg = 'Vendors and Purchase orders loaded';
  } // ngOnInit
  ngOnDestroy(): void {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  } // ngOnDestroy

  /**
   * onPickVendor - Another way to use Observables, subscribe to the select change event
   * then load specific vendor products for subsequent selection
   */
  onPickVendor(): void {
    this.subscription = this.generatorForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.selectedPO = {
          id: 0,
          vendorid: 0,
          items: [],
          amount: 0,
          podate: '',
        };
        this.selectedVendor = val;
        this.loadVendorPOs();
        this.pickedPO = false;
        this.hasPOs = false;
        this.msg = `POs loaded for ${this.selectedVendor.name}!`;
        this.pickedVendor = true;
        this.items = []; // array for the report
      });
  } // onPickVendor
  /**
   * onPickedPO - subscribe to the select change event then
   * update array containing items.
   */
  onPickedPO(): void {
    const xSubscr = this.generatorForm
      .get('poid')
      ?.valueChanges.subscribe((val) => {
        this.total = 0;
        this.selectedPO = val;
        this.selectedPO.items.map((item) => {
          if (this.products$) {
            this.products$
              .pipe(
                map((product) =>
                  product.find((product) => product.id === item.productid)
                )
              )
              .subscribe((prod) => {
                if (prod) {
                  const report: PurchaseItem = {
                    id: item.id,
                    price: item.price,
                    productid: item.productid,
                    po: item.po,
                    qty: item.qty,
                    name: prod.name,
                  };
                  this.items.push(report);
                }
                this.hasPOs = true;
              });
          }
        });
        this.selectedPO.items.forEach(
          (sub) => (this.sub += sub.qty * sub.price)
        );
        this.selectedPO.items.forEach(
          (tax) => (this.tax += tax.qty * tax.price * 0.13)
        );
        this.selectedPO.items.forEach(
          (total) => (this.total += total.qty * total.price * 1.13)
        );
        this.hasPOs = true;
      });
    this.subscription?.add(xSubscr); // add it as a child, so all can be destroyed together
  } // onPickedPO

  /**
   * loadVendorPOs - filter for a  vendor's products
   */
  loadVendorPOs(): void {
    this.vendorpos$ = this.purchaseOrderService
      .getById(this.selectedVendor.id)
      .pipe(
        catchError((error) => {
          if (error.error instanceof ErrorEvent) {
            this.msg = `Error: ${error.error.message}`;
          } else {
            this.msg = `Error: ${error.message}`;
          }
          return of([]); // returns an empty array if there's a problem
        })
      );
  } // loadVendorPOs
  viewPdf(): void {
    this.hidePricingFields = false;
    window.open(`${PDFURL}${this.selectedPO.id}`, '');
  } // viewPdf
}
