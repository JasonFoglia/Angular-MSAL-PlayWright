import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';
import { TextEncoder } from 'node:util';

// Workaround for Jest error - ReferenceError: TextEncoder is not defined
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: TextEncoder
});
