export type RulesetInteractionFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select';

export interface RulesetInteractionOption {
  value: string;
  label: string;
}

export interface RulesetInteractionField {
  /*
   * Ruleset-owned identity for this value.
   * This becomes the key persisted inside
   * RulesetExtensionData.values.
   */
  id: string;

  label: string;

  type: RulesetInteractionFieldType;

  description?: string;

  required?: boolean;

  /*
   * Optional default supplied by the
   * Ruleset when no persisted value exists.
   */
  defaultValue?:
    | string
    | number
    | boolean
    | null;

  /*
   * Used by select fields.
   */
  options?:
    RulesetInteractionOption[];
}

export interface RulesetInteractionDefinition {
  /*
   * Identifies the module-owned domain
   * concept this interaction extends.
   *
   * Examples:
   *   Regions.Feature
   *   Regions.Section
   *   Regions.PathSegment
   *   Regions.Piece
   *   Regions.Map
   */
  target: string;

  /*
   * Ruleset-owned schema identity.
   * Persisted with RulesetExtensionData
   * so stored values can be associated
   * with the definition that produced them.
   */
  schemaId: string;

  fields:
    RulesetInteractionField[];
}