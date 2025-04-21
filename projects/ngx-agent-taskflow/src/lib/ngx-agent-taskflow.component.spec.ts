import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxAgentTaskflowComponent } from './taskflow-wrapper/ngx-agent-taskflow-wrapper.component';

describe('NgxAgentTaskflowComponent', () => {
  let component: NgxAgentTaskflowComponent;
  let fixture: ComponentFixture<NgxAgentTaskflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxAgentTaskflowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxAgentTaskflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
