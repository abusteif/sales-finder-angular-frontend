import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { StatusDialogComponent, StatusDialogData } from '../../shared/status-dialog/status-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class StatusDialogService {

  constructor(private dialog: MatDialog) {}

  /**
   * Show a success dialog
   */
  showSuccess(title: string, message: string, confirmButtonText?: string): Observable<boolean> {
    return this.showDialog({
      type: 'success',
      title,
      message,
      confirmButtonText: confirmButtonText || 'OK'
    });
  }

  /**
   * Show an error dialog
   */
  showError(title: string, message: string, confirmButtonText?: string): Observable<boolean> {
    return this.showDialog({
      type: 'error',
      title,
      message,
      confirmButtonText: confirmButtonText || 'OK'
    });
  }

  /**
   * Show a warning dialog
   */
  showWarning(title: string, message: string, showCancelButton?: boolean): Observable<boolean> {
    return this.showDialog({
      type: 'warning',
      title,
      message,
      showCancelButton: showCancelButton || false,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    });
  }

  /**
   * Show an info dialog
   */
  showInfo(title: string, message: string, confirmButtonText?: string): Observable<boolean> {
    return this.showDialog({
      type: 'info',
      title,
      message,
      confirmButtonText: confirmButtonText || 'OK'
    });
  }

  /**
   * Show a confirmation dialog
   */
  showConfirmation(title: string, message: string, confirmButtonText?: string, cancelButtonText?: string): Observable<boolean> {
    return this.showDialog({
      type: 'info',
      title,
      message,
      showCancelButton: true,
      confirmButtonText: confirmButtonText || 'Confirm',
      cancelButtonText: cancelButtonText || 'Cancel'
    });
  }

  /**
   * Generic method to show any type of dialog
   */
  private showDialog(data: StatusDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(StatusDialogComponent, {
      data,
      disableClose: false,
      autoFocus: false,
      maxWidth: '90vw',
      maxHeight: '90vh'
    });

    return dialogRef.afterClosed();
  }
} 