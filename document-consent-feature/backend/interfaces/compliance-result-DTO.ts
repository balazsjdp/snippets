import type Document from "../entities/document.model";

export interface ComplianceResultDTO {
	compliant: boolean;
	missingDocuments: Document[];
}
