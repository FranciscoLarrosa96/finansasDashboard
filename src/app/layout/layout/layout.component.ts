import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { AddMovementModalComponent } from '../../shared/add-movement-modal/add-movement-modal.component';

@Component({
  selector: 'app-layout',
  imports: [NavbarComponent, RouterOutlet,AddMovementModalComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  showModal = signal(false);

  openModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }
}
