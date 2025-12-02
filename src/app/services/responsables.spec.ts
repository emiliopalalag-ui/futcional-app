import { TestBed } from '@angular/core/testing';

import { ResponsablesService } from './responsables.service';

describe('Responsables', () => {
  let service: ResponsablesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponsablesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
