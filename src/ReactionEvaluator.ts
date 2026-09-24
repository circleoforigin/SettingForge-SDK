import type {
  Reaction,
  ReactionCondition,
} from './Reaction';

function isPlainObject(
  value: unknown
): value is Record<
  string,
  unknown
> {
  if (
    typeof value !==
      'object' ||
    value === null
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value
    );

  return (
    prototype ===
      Object.prototype ||
    prototype === null
  );
}

export function conditionMatches(
  condition:
    ReactionCondition,

  payload: unknown
): boolean {
  if (
    !isPlainObject(
      payload
    )
  ) {
    return false;
  }

  if (
    !Object.hasOwn(
      payload,
      condition.field
    )
  ) {
    return false;
  }

  const actual =
    payload[
      condition.field
    ];

  const expected =
    condition.value;

  switch (
    condition.operator
  ) {
    case 'equals':
      return (
        expected !== undefined &&
        typeof actual ===
          typeof expected &&
        actual === expected
      );

    case 'notEquals':
      return (
        expected !== undefined &&
        typeof actual ===
          typeof expected &&
        actual !== expected
      );

    case 'contains':
      return (
        typeof actual ===
          'string' &&
        typeof expected ===
          'string' &&
        actual.includes(
          expected
        )
      );

    case 'notContains':
      return (
        typeof actual ===
          'string' &&
        typeof expected ===
          'string' &&
        !actual.includes(
          expected
        )
      );

    case 'greaterThan':
      return (
        typeof actual ===
          'number' &&
        typeof expected ===
          'number' &&
        actual > expected
      );

    case 'greaterThanOrEqual':
      return (
        typeof actual ===
          'number' &&
        typeof expected ===
          'number' &&
        actual >= expected
      );

    case 'lessThan':
      return (
        typeof actual ===
          'number' &&
        typeof expected ===
          'number' &&
        actual < expected
      );

    case 'lessThanOrEqual':
      return (
        typeof actual ===
          'number' &&
        typeof expected ===
          'number' &&
        actual <= expected
      );

    case 'isTrue':
      return (
        actual === true
      );

    case 'isFalse':
      return (
        actual === false
      );

    default:
      return false;
  }
}

export function reactionMatches(
  reaction: Reaction,
  eventId: string,
  payload: unknown
): boolean {
  if (
    reaction.triggerEventId !==
    eventId
  ) {
    return false;
  }

  return reaction.conditions.every(
    (condition) =>
      conditionMatches(
        condition,
        payload
      )
  );
}