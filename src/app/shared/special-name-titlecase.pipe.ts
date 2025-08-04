import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'specialNameTitlecase',
  standalone: false
})
export class SpecialNameTitlecasePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }
    
    // Special case for JB Hi-Fi - capitalize everything
    if (value.toLowerCase() === 'jb hi-fi') {
      return 'JB HI-FI';
    }
    
    // For all other store names, apply titlecase
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

}
