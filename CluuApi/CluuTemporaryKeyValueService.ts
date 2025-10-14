import { CluuTemporaryKeyValue } from "./CluuTemporaryKeyValue";
import { CluuTypedPropertyValue } from "./CluuTypedPropertyValue";


export class CluuTemporaryKeyValueService {
	private static _instance: CluuTemporaryKeyValueService;

	private constructor() { }

	public static get instance(): CluuTemporaryKeyValueService {
		if (!this._instance) {
			this._instance = new CluuTemporaryKeyValueService();
		}
		return this._instance;
	}

	public tryExtractCluuTemporaryKeyValue(typedValue: CluuTypedPropertyValue): string | null {
		if (typedValue == null) {
			return null;
		} else if (typeof typedValue === 'object' && '$tmpKey' in typedValue) {
			return (typedValue as CluuTemporaryKeyValue).$tmpKey;
		} else {
			return null;
		}
	}
}
