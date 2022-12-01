import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VendorHomeComponent } from './vendor/vendor-home/vendor-home.component';
import { ProductHomeComponent } from './product/product-home/product-home.component';
import { GeneratorComponent } from './purchase/generator/generator.component';
import { ViewerComponent } from './purchase/viewer/viewer.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, title: 'Case Study - Home' },
  { path: 'vendors', component: VendorHomeComponent, title: 'Case Study - Vendors' },
  { path: 'products', component: ProductHomeComponent, title: 'Case Study - Products' },
  { path: 'generator', component: GeneratorComponent, title: 'Case Study - Generator' },
  { path: 'viewer', component: ViewerComponent, title: 'Case Study - Viewer' },
  { path: '', component: HomeComponent, title: 'Case Study - Home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
