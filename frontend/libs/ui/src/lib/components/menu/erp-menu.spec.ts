import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErpMenuComponent } from './erp-menu';

describe('ErpMenuComponent', () => {
  let fixture: ComponentFixture<ErpMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErpMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErpMenuComponent);
    fixture.componentRef.setInput('items', [
      { id: 'name', label: 'Ada Lovelace', header: true },
      { id: 'logout', label: 'Logout' },
    ]);
    fixture.componentRef.setInput('ariaLabel', 'Account menu');
    fixture.detectChanges();
  });

  it('renders projected trigger content', () => {
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector('.erp-menu__trigger')!.textContent = 'A';
    expect(host.querySelector('.erp-menu__trigger')).toBeTruthy();
  });

  it('emits itemSelected for actionable items only', () => {
    const emitted: string[] = [];
    fixture.componentInstance.itemSelected.subscribe((item) =>
      emitted.push(item.id),
    );

    fixture.componentInstance['onItemClick']({
      id: 'name',
      label: 'Ada',
      header: true,
    });
    fixture.componentInstance['onItemClick']({ id: 'logout', label: 'Logout' });

    expect(emitted).toEqual(['logout']);
  });
});
