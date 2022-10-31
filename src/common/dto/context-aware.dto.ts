import { Allow } from 'class-validator';

export class ContextAwareDto {
  @Allow()
  context?: {
    params: any;
    query: any;
    user: any;
  };
}
