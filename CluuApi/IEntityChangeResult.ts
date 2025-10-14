import { CluuTypedPropertyValue } from "./CluuTypedPropertyValue";
import { ICluuEntityReference } from "./ICluuEntityReference";


export interface IEntityChangeResult {
	entityReference: ICluuEntityReference;
	updatedKeyValue: CluuTypedPropertyValue;
}
