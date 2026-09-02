import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyBorrowingsComponent } from './pages/my-borrowings/my-borrowings.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'my-borrowings', pathMatch: 'full' },
  { path: 'my-borrowings', component: MyBorrowingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'my-borrowings' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }