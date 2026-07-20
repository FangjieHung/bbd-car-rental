import { Partner } from '@car-rental/domain';

export type FlowMode = { kind: 'consumer' } | { kind: 'partner'; partner: Partner };
