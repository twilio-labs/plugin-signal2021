import { Except } from 'type-fest';
import { Demo } from './demo';

export type DemosData = { demos: { [key: string]: Except<Demo, 'key'> } };

export type InspectorApi = {
  demos: DemosData;
};
