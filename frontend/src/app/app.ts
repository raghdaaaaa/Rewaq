import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',  // مش .component.html
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'rewaq-frontend';
}