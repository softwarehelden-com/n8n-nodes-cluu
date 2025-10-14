import { IExecuteFunctions, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { CluuQueryService } from '../CluuApi/Query/CluuQueryService';

interface IClassInfo {
	Caption: string;
	ClassName: string;
}

interface IPropertyInfo {
	Caption: string;
	PropertyName: string;
}

export async function getCluuClassNamesAsync(
	functions: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const executeFunctions = functions as unknown as IExecuteFunctions;

	const entities = await CluuQueryService.instance.queryCluuAsync<IClassInfo>(
		'FROM CluuMetadata.ClassInfo SELECT Caption, ClassName',
		executeFunctions,
	);

	return entities
		.map((x) => ({
			name: `${x.Caption ?? '-'} (${x.ClassName})`,
			value: x.ClassName,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPropertyNamesAsync(
	functions: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const executeFunctions = functions as unknown as IExecuteFunctions;

	const cluuClassName = functions.getCurrentNodeParameter('cluuClassName') as string;

	if (!cluuClassName) {
		return [];
	}

	const entities = await CluuQueryService.instance.queryCluuAsync<IPropertyInfo>(
		`FROM CluuMetadata.PropertyInfo
					 WHERE ClassInfo.ClassName == "${cluuClassName}"
					 SELECT Caption, PropertyName`,
		executeFunctions,
	);

	return entities
		.map((x) => ({
			name: `${x.Caption ?? '-'} (${x.PropertyName})`,
			value: x.PropertyName,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}
