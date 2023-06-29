import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    // Add Material modules here
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  exports: [MatSelectModule, MatFormFieldModule, MatButtonModule],
})
export class MaterialModule {}
