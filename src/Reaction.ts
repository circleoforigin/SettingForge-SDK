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
  triggerEventId: string;
  conditions: ReactionCondition[];
}

export interface LegacyReaction {
  id: string;
  triggerActionId: string;
  conditions: ReactionCondition[];
}

export function normalizeReaction(
  reaction:
    | Reaction
    | LegacyReaction
): Reaction {
  if (
    'triggerEventId' in reaction
  ) {
    return {
      id: reaction.id,

      triggerEventId:
        reaction.triggerEventId,

      conditions:
        reaction.conditions.map(
          (condition) => ({
            ...condition,
          })
        ),
    };
  }

  return {
    id: reaction.id,

    triggerEventId:
      reaction.triggerActionId,

    conditions:
      reaction.conditions.map(
        (condition) => ({
          ...condition,
        })
      ),
  };
}
