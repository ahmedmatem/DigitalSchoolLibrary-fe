import { Component, inject } from '@angular/core';

import { ActivatedRoute, } from '@angular/router';

@Component({
  selector: 'sl-resource-details-page',
  standalone: true,
  templateUrl: './resource-details-page.html',
  styleUrl: './resource-details-page.scss',
})
export class ResourceDetailsPage {
  private readonly route = inject(ActivatedRoute);

  readonly resourceId = this.route.snapshot.paramMap.get('id');
}