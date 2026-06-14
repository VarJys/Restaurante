import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async canActivate(): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return true; // En el servidor, permite el paso y deja que el navegador decida
    }

    const session = await this.supabaseService.getSession();
    if (session) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
