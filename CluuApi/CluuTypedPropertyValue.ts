import { CluuTemporaryKeyValue } from "./CluuTemporaryKeyValue";


export declare type CluuTypedPropertyValue = null |
	string |
{ $byte: number; } |
{ $short: number; } |
	number |
{ $long: number; } |
	boolean |
{ $guid: string; } |
{ $float: string; } |
{ $double: string; } |
{ $decimal: string; } |
{ $datetime: string; } |
{ $datetimeoffset: string; } |
{ $dateonly: string; } |
{ $timeonly: string; } |
{ $timespan: string; } |
{ $binary: string; } |
	CluuTemporaryKeyValue;
