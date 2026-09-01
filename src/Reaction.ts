export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'isTrue'
  | 'isFalse';

export interface ReactionCondition {
  field: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface Reaction {
  id: string;
  triggerActionId: string;
  conditions: ReactionCondition[];
}
