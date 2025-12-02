import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponsablesPage } from './responsables.page';

describe('ResponsablesPage', () => {
  let component: ResponsablesPage;
  let fixture: ComponentFixture<ResponsablesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsablesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
