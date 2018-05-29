
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Catalog, IndexDefinition, ObjectIndexService } from 'object-index-service';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, CommonModule, FormsModule
  ],
  providers: [ObjectIndexService],
  bootstrap: [AppComponent]
})
export class AppModule { }
