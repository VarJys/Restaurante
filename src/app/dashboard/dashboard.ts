import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

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
  
  // Forms
  newClient = { fullName: '', identifier: '' };
  newPayment = { clientId: '', amount: 0, startDate: '', endDate: '' };

  constructor(public supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    if (!this.supabaseService.user) {
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
  }

  // Stats
  get activeClientsCount() {
    const activePayments = this.payments.filter(p => p.status === 'active');
    const uniqueClients = new Set(activePayments.map(p => p.client_id));
    return uniqueClients.size;
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
  async addClient() {
    if (!this.newClient.fullName) return;
    await this.supabaseService.addClient(this.newClient.fullName, this.newClient.identifier);
    this.newClient = { fullName: '', identifier: '' };
    await this.loadData();
  }

  async addPayment() {
    if (!this.newPayment.clientId || !this.newPayment.startDate || !this.newPayment.endDate) return;
    await this.supabaseService.addPayment(
      this.newPayment.clientId, 
      this.newPayment.amount, 
      this.newPayment.startDate, 
      this.newPayment.endDate
    );
    this.newPayment = { clientId: '', amount: 0, startDate: '', endDate: '' };
    await this.loadData();
    this.activeTab = 'payments';
  }

  async logout() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
