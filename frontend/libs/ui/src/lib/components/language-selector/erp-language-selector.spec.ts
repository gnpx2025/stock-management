import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErpLanguageSelectorComponent } from './erp-language-selector';

describe('ErpLanguageSelectorComponent', () => {
  let fixture: ComponentFixture<ErpLanguageSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErpLanguageSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErpLanguageSelectorComponent);
    fixture.componentRef.setInput('language', 'en');
    fixture.componentRef.setInput('ariaLabel', 'Language');
    fixture.detectChanges();
  });

  it('shows compact flag + EN code', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('EN');
    expect(text).not.toContain('English');
  });

  it('emits languageChange when selecting Arabic', () => {
    const emitted: string[] = [];
    fixture.componentInstance.languageChange.subscribe((value) =>
      emitted.push(value),
    );
    fixture.componentInstance['select']('ar');
    expect(emitted).toEqual(['ar']);
  });
});
