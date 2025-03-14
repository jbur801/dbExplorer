import { Field } from "./FieldTypes"

export type TaskType = 'finite' | 'infinite'

export interface BaseTask<T extends TaskType> {
  type: T;
  id: string //UUID probably
  fields: Field[];
  subTaskIds: string[];//subtask ids in db
  creationTime: number;
  totalSessionTime: number;
  totalSessionCount: number;
  // repititionStrategy?:RepititionStrategy; // should be part of task factory not task
}

export type ValidTask<T extends TaskType> = BaseTask<T> &
  T extends 'finite' ? { completionPercentage: number/*0-100*/ } :
  T extends 'infinite' ? {} :
  {};

export type Task = {
  [K in TaskType]: ValidTask<K>;
}[TaskType];

export type RepititionStrategyType = 'periodic' | 'onCompletion' | 'bespoke'

export interface BaseRepitionStrategy<T extends RepititionStrategyType> {
  type: T;
  maxRepitions?: number;
  repititionCount: number;
  unique: boolean;//determines whether multiple iterations of the task can exist at once
  lastRepititionTimestamp: number;
}

export type ValidRepitionStrategy<T extends RepititionStrategyType> =
  BaseRepitionStrategy<T> & T extends 'periodic' ?
  { repititionIntervalSeconds: number } :
  T extends 'onCompletion' ? { subscribedTaskIds: string[], delaySeconds?: number, ownedByTriggerTask: boolean } :
  T extends 'bespoke' ? { triggerLogic: () => void } :
  {};

export type RepititionStrategy = {
  [K in RepititionStrategyType]: ValidRepitionStrategy<K>;
}[RepititionStrategyType];


