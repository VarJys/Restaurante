import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  activeTab = 'overview';
  
  // Data
  clients: any[] = [];
  payments: any[] = [];
  consumptions: any[] = [];

  // Calculator
  pricePerMeal: number = 10000;
  calcDaysPerWeek: number = 5;
  calcMealsPerDay: number = 1;
  calcWeeks: number = 4;
  
  editingClient: any = null;
  
  // Forms
  newClient = { fullName: '', identifier: '' };
  newPayment = { clientId: '', amount: 0, amountPaid: 0, startDate: '', endDate: '' };

  constructor(
    public supabaseService: SupabaseService, 
    private router: Router, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Do nothing on the server
    }

    const session = await this.supabaseService.getSession();
    if (!session) {
      this.router.navigate(['/login']);
      return;
    }
    await this.loadData();
    this.updateCalculator();
  }

  async loadData() {
    const { data: clientsData } = await this.supabaseService.getClients();
    this.clients = clientsData || [];

    const { data: paymentsData } = await this.supabaseService.getPayments();
    this.payments = paymentsData || [];
    
    // Check expired payments dynamically
    const today = new Date().toISOString().split('T')[0];
    this.payments.forEach(p => {
      if (p.end_date < today && p.status !== 'expired') {
        p.status = 'expired';
      }
    });

    const { data: consumptionsData } = await this.supabaseService.getConsumptions();
    this.consumptions = consumptionsData || [];
    
    // Force UI to update since Supabase calls might happen outside Angular zone
    this.cdr.detectChanges();
  }

  // Stats
  get activeClientsCount() {
    const activePayments = this.payments.filter(p => p.status === 'active');
    const uniqueClients = new Set(activePayments.map(p => p.client_id));
    return uniqueClients.size;
  }

  get activePayments() {
    return this.payments.filter(p => p.status === 'active');
  }

  get expiredPayments() {
    return this.payments.filter(p => p.status === 'expired');
  }

  // Calculator Logic
  get calculatedTotal() {
    return this.pricePerMeal * this.calcDaysPerWeek * this.calcMealsPerDay * this.calcWeeks;
  }

  updateCalculator() {
    this.newPayment.amount = this.calculatedTotal;
  }

  // Actions
  async saveClient() {
    if (!this.newClient.fullName) return;
    
    if (this.editingClient) {
      await this.supabaseService.updateClient(this.editingClient.id, this.newClient.fullName, this.newClient.identifier);
      this.editingClient = null;
    } else {
      await this.supabaseService.addClient(this.newClient.fullName, this.newClient.identifier);
    }

    this.newClient = { fullName: '', identifier: '' };
    await this.loadData();
    
    Swal.fire({
      icon: 'success',
      title: '¡Guardado!',
      text: 'El comensal se guardó exitosamente',
      timer: 1500,
      showConfirmButton: false
    });
  }

  editClient(client: any) {
    this.editingClient = client;
    this.newClient = { fullName: client.full_name, identifier: client.identifier };
  }

  cancelEdit() {
    this.editingClient = null;
    this.newClient = { fullName: '', identifier: '' };
  }

  async deleteClient(client: any) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar a ${client.full_name} borrará todos sus pagos y consumos permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#7f8c8d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      await this.supabaseService.deleteClient(client.id);
      await this.loadData();
      Swal.fire('Eliminado', 'El comensal ha sido eliminado.', 'success');
    }
  }

  async addPayment() {
    if (!this.newPayment.clientId || !this.newPayment.startDate || !this.newPayment.endDate) return;
    await this.supabaseService.addPayment(
      this.newPayment.clientId, 
      this.newPayment.amount, 
      this.newPayment.amountPaid || 0,
      this.newPayment.startDate, 
      this.newPayment.endDate
    );
    this.newPayment = { clientId: '', amount: 0, amountPaid: 0, startDate: '', endDate: '' };
    await this.loadData();
    this.activeTab = 'payments';
    
    Swal.fire({
      icon: 'success',
      title: 'Mensualidad Registrada',
      timer: 1500,
      showConfirmButton: false
    });
  }

  async addAbono(payment: any) {
    const { value: input } = await Swal.fire({
      title: 'Abonar a Mensualidad',
      input: 'number',
      inputLabel: `Ingrese el monto a abonar a ${payment.clients?.full_name}:`,
      inputPlaceholder: 'Ej: 15000',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      confirmButtonText: 'Abonar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || parseFloat(value) <= 0) {
          return 'Debes ingresar un monto válido mayor a 0';
        }
        return null;
      }
    });

    if (input) {
      const amount = parseFloat(input);
      const currentPaid = payment.amount_paid || 0;
      const newPaid = currentPaid + amount;
      await this.supabaseService.updatePaymentAmountPaid(payment.id, newPaid);
      await this.loadData();
      Swal.fire('¡Éxito!', 'El abono se registró correctamente.', 'success');
    }
  }

  async logout() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
