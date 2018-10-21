import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndexDefinition } from "object-index-service";
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule, CommonModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  //const fixture = TestBed.createComponent(AppComponent);
  // Basic Component Tests
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'object-index-service-demo'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('object-index-service-demo');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to object-index-service-demo!');
  }));

  // Rendering tests
  it('should render the selector with no chosen index', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = compiled.querySelector('#indexSelector');
    expect(selector).toBeTruthy();
    expect(selector.textContent).toContain('');
  }));
  it('should have the 3 options in the selector if there are 3 indices', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.indices = [
      <IndexDefinition>{indexName: 'index1'},
      <IndexDefinition>{indexName: 'index2'},
      <IndexDefinition>{indexName: 'index3'}
    ];
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    const selector = compiled.querySelector('#indexSelector');
    expect(selector.children.length).toEqual(3);
  }));
  //it('should update chosenIndex with the selected option', async(() => {}));
  //it('should call getDogs() when the selection changes', async(() => {}));
  //it('should display the object array of gotten dogs', async(() => {}));
  //it('should...', async(() => {}));
});
