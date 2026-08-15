import { Component } from '@angular/core';
import { PageContainer } from '../../../../layout/page-container/page-container';
import { Button } from "../../../../shared/ui/button/button";

@Component({
  selector: 'sl-catalog-page',
  imports: [PageContainer, Button],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {}
