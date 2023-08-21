import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MemoDetailsPage } from './memo-details.page';

const routes: Routes = [
  {
    path: '',
    component: MemoDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MemoDetailsPageRoutingModule {}
