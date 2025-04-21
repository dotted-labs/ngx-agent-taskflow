import { TestBed } from '@angular/core/testing';

import { NgxAgentTaskflowService } from './services/ngx-agent-taskflow.service';

describe('NgxAgentTaskflowService', () => {
  let service: NgxAgentTaskflowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxAgentTaskflowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
