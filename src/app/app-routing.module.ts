import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PostMenuComponent } from './modules/post-menu/post-menu.component';
import { AuthGuard } from './modules/auth/authguard/authguard';

const routes: Routes = [
  { path: 'Gadgets', loadChildren: () => import('./modules/gadget/gadget.module').then(m => m.GadgetModule) },
  { path: 'Vehicles', loadChildren: () => import('./modules/vehicle/vehicle.module').then(m => m.VehicleModule) },
  { path: 'user', loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),canActivate: [AuthGuard] },
  { path : '', component : DashboardComponent},
  { path : 'post-menu', component : PostMenuComponent,canActivate: [AuthGuard]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
