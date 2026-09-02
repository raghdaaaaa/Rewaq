import { TestBed } from '@angular/core/testing';

import { Borrowing } from './borrowing';

describe('Borrowing', () => {
  let service: Borrowing;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Borrowing);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
