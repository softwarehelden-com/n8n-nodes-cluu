import { CluuEntityChangeType } from './CluuEntityChangeType';
import { CluuTypedPropertyValue } from './CluuTypedPropertyValue';

export interface ICluuEntityChange {
	cluuClassName: string;
	key: CluuTypedPropertyValue;
	type: CluuEntityChangeType;
	values?: { [propertyName: string]: CluuTypedPropertyValue };
}
