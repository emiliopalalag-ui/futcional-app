import { TestBed } from '@angular/core/testing';

import { Inscripciones } from './inscripciones';

describe('Inscripciones', () => {
  let service: Inscripciones;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Inscripciones);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
