import type DocumentContent from "../entities/document-content.model";
import type Statement from "../entities/statement.model";

export interface DocumentDTO {
	id: number;
	title: string;
	description: string;
	icon: string;
	versions: DocumentVersionDTO[];
	userResponded: boolean;
}

export interface DocumentVersionDTO {
	id: number;
	version: number;
	language: string;
	validFrom: Date;
	contents: DocumentContent[];
	statements: Statement[];
	userResponded: boolean;
	completionDate?: Date;
}
