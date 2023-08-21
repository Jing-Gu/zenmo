import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MemoDetailsPageRoutingModule } from './memo-details-routing.module';

import { MemoDetailsPage } from './memo-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MemoDetailsPageRoutingModule
  ],
  declarations: [MemoDetailsPage]
})
export class MemoDetailsPageModule {}
