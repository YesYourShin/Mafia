import { ValueTransformer } from 'typeorm';

export class GameStatusTransformer implements ValueTransformer {
  to(entityValue: string): boolean {
    return entityValue === 'inGame'
      ? true
      : entityValue === 'finished' ?? false;
  }

  from(databaseValue: boolean): string {
    return databaseValue ? 'inGame' : 'finished';
  }
}
