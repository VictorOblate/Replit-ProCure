/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare module 'supertest' {
  import { SuperTest, Test } from 'supertest';
  export default function request(app: any): SuperTest<Test>;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}