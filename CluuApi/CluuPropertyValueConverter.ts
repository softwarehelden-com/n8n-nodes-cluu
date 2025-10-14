/*import { CluuTypedPropertyValue } from './CluuTypedPropertyValue';


export class CluuPropertyValueConverter {
	private static _instance: CluuPropertyValueConverter;

	public static get instance(): CluuPropertyValueConverter {
		if (!CluuPropertyValueConverter._instance) {
			CluuPropertyValueConverter._instance = new CluuPropertyValueConverter();
		}
		return CluuPropertyValueConverter._instance;
	}

	private constructor() { }

	public extractRawCluuPropertyValue(
		typedValue: CluuTypedPropertyValue
	): null | number | string | boolean {
		if (typedValue === null) {
			return null;
		}

		if (typeof typedValue === 'string' ||
			typeof typedValue === 'number' ||
			typeof typedValue === 'boolean') {
			return typedValue;
		}

		return Object.values(typedValue)[0];
	}
}
*/
