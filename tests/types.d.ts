/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare module 'supertest' {
  import * as supertest from 'supertest';
  export = supertest;
}