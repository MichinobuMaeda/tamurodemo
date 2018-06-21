import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatCheckboxModule } from '@angular/material';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    TranslateModule,
    CommonModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    TranslateModule,
    CommonModule
  ],
})
export class ShareModule { }
