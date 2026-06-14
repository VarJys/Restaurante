import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    // Check initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        this.currentUser.next(session.user);
      }
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  public async getSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // --- AUTH METHODS (Admin Only) ---
  
  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  get user(): User | null {
    return this.currentUser.value;
  }

  async signUpAdmin(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  async signInWithPassword(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  // --- CLIENTS METHODS ---
  
  async getClients() {
    return await this.supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async addClient(fullName: string, identifier: string = '') {
    return await this.supabase
      .from('clients')
      .insert([{ full_name: fullName, identifier }])
      .select();
  }

  async updateClient(id: string, fullName: string, identifier: string) {
    return await this.supabase
      .from('clients')
      .update({ full_name: fullName, identifier })
      .eq('id', id)
      .select();
  }

  async deleteClient(id: string) {
    return await this.supabase
      .from('clients')
      .delete()
      .eq('id', id);
  }

  // --- PAYMENTS METHODS ---
  
  async getPayments() {
    return await this.supabase
      .from('payments')
      .select('*, clients(*)') // Join with clients table to get names
      .order('end_date', { ascending: true });
  }

  async addPayment(clientId: string, amount: number, amountPaid: number, startDate: string, endDate: string) {
    return await this.supabase
      .from('payments')
      .insert([{
        client_id: clientId,
        amount: amount,
        amount_paid: amountPaid,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      }])
      .select();
  }

  async updatePaymentAmountPaid(paymentId: string, newAmountPaid: number) {
    return await this.supabase
      .from('payments')
      .update({ amount_paid: newAmountPaid })
      .eq('id', paymentId)
      .select();
  }

  // --- CONSUMPTIONS METHODS ---

  async getConsumptions() {
    return await this.supabase
      .from('consumptions')
      .select('*, clients(*)')
      .order('consumption_date', { ascending: false });
  }

  async addConsumption(clientId: string, mealType: 'lunch' | 'dinner', date: string) {
    return await this.supabase
      .from('consumptions')
      .insert([{
        client_id: clientId,
        meal_type: mealType,
        consumption_date: date
      }])
      .select();
  }
}
