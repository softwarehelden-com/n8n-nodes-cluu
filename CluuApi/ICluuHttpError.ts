import { IProblemDetails } from "./IProblemDetails";


export interface ICluuHttpError {
	response: {
		data: IProblemDetails;
	};
	status: number;
}
