import type { Context } from "moleculer";
import type { TypeORMError } from "typeorm";
import { userStatementRepoInstance } from "../../../instances";
import { brokerGetUserById } from "../../general/user/user.service";
import BaseService from "../../utils/base/base-service";
import MyObfuscatedError from "../../utils/definitions/errors/MyObfuscatedError";
import MyObfuscatedErrorType from "../../utils/definitions/errors/MyObfuscatedErrorType";
import {
	brokerGetDocumentForUser,
	brokerGetDocumentList,
	brokerGetDocuments,
	brokerGetDocumentVersions,
	brokerGetUserStatements,
	brokerGetUserStatementSummary,
} from "../document.service";
import type DocumentVersion from "../entities/document-version.model";
import type Document from "../entities/document.model";
import type Statement from "../entities/statement.model";
import type UserStatement from "../entities/user-statement.model";
import type { ComplianceResultDTO } from "../interfaces/compliance-result-DTO";
import type { DocumentDTO } from "../interfaces/document-DTO";
import type { UserStatementsByVersion } from "../interfaces/user-statement-by-version.interface";
import type { UserStatementDTO } from "../interfaces/user-statement-DTO";

export interface IConsentService {
	/**
	 * Service broker pattern method.
	 * @param ctx - The Moleculer context.
	 * @returns The current instance of the service.
	 */
	sbp(ctx: Context): this;
	/**
	 * Retrieves a list of documents accessible to a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of DocumentDTO objects. Each DocumentDTO includes details of the documents the user can access.
	 */
	getDocumentListForUser(userId: number): Promise<DocumentDTO[]>;
	/**
	 * Retrieves the full document details for a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of Document objects. Each Document contains all the information linked to the documents available to the user.
	 */
	getDocumentsForUser(userId: number): Promise<Document[]>;
	/**
	 * Retrieves the compliance status for a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to a ComplianceResultDTO object. This object contains the compliance details for the user.
	 */
	getUserCompliance(userId: number): Promise<ComplianceResultDTO>;

	/**
	 * Retrieves a specific document for a user based on their access permissions.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to the Document object if the user has access, or null if the document is not found or inaccessible.
	 */
	getDocumentForUser(documentId: number, userId: number): Promise<Document | null>;

	/**
	 * Retrieves the content statements from a specific version of a document.
	 *
	 * @param version - The version of the document from which to retrieve statements.
	 * @returns An array of Statement objects associated with the specified document version.
	 */
	getContentStatements(version: DocumentVersion): Statement[];
}

export class ConsentService extends BaseService implements IConsentService {
	async getDocumentListForUser(userId: number): Promise<DocumentDTO[]> {
		this.logger?.info(`Loading document list for user: ${userId}`);
		const user = await brokerGetUserById(this.ctx!, userId);

		if (!user || !user?.team?.id) {
			this.logger?.warn(`User ${userId} not found when loading document list`);
			throw new MyObfuscatedError(404, MyObfuscatedErrorType.ERR_AIS_03);
		}

		this.logger?.info(`Querying document list for user ${userId} by team ${user.team.id}`);
		const documentList: DocumentDTO[] = await brokerGetDocumentList(this.ctx!, user.team.id);

		const documentIds = documentList.map((document) => document.id);
		const statementRatios = await Promise.all(documentIds.map((id) => brokerGetUserStatementSummary(this.ctx!, id, userId)));

		const documentRatiosMap = documentIds.reduce(
			(acc, id, index) => {
				acc[id] = statementRatios[index];
				return acc;
			},
			{} as Record<number, UserStatementsByVersion[]>,
		);

		for (const document of documentList) {
			const statementsByVersion = documentRatiosMap[document.id];
			for (const ver of document.versions) {
				const versionResponse = statementsByVersion.find((s) => s.versionId === ver.id);
				ver.userResponded =
					versionResponse?.totalStatements && versionResponse?.userStatements
						? versionResponse.totalStatements <= versionResponse.userStatements
						: false;

				// Set completionDate if the user has responded to all statements
				if (ver.userResponded && versionResponse?.completionDate) {
					ver.completionDate = versionResponse.completionDate;
				}
			}
		}

		this.logger?.info(`Document list of ${documentList.length} found for user ${userId}`);
		return documentList;
	}

	async getDocumentsForUser(userId: number): Promise<Document[]> {
		this.logger?.info(`Loading documents for user: ${userId}`);
		const user = await brokerGetUserById(this.ctx!, userId);

		if (!user || !user?.team?.id) {
			this.logger?.warn(`User ${userId} not found when loading documens`);
			throw new MyObfuscatedError(404, MyObfuscatedErrorType.ERR_AIS_03);
		}
		this.logger?.info(`Querying documents for user ${userId} by team ${user.team.id}`);
		const documents: Document[] = await brokerGetDocuments(this.ctx!, user.team.id);

		this.logger?.info(`${documents.length} documents found for user ${userId}`);
		return documents;
	}

	async getDocumentForUser(documentId: number, userId: number, versionId?: number): Promise<Document | null> {
		this.logger?.info(`Getting document ${documentId} for user ${userId}`);
		const document = await brokerGetDocumentForUser(this.ctx!, documentId, userId, versionId);

		if (!document) {
			this.logger?.warn(`Document ${documentId} not found for user ${userId} ${versionId ? `and version ${versionId}` : ""}`);
			return null;
		}

		this.logger?.info(`Document ${documentId} found for user ${userId} ${versionId ? `and version ${versionId}` : ""}`);
		return document;
	}

	async getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
		this.logger?.info(`Getting document versions for document ${documentId}`);
		const document = await brokerGetDocumentVersions(this.ctx!, documentId);

		if (!document) {
			this.logger?.warn(`Document ${documentId} not found`);
			return [];
		}

		this.logger?.info(`Document ${documentId} found`);
		return document;
	}

	async getUserCompliance(userId: number): Promise<ComplianceResultDTO> {
		this.logger?.info(`Loading compliance for user: ${userId}`);
		const user = await brokerGetUserById(this.ctx!, userId);
		if (!user || !user?.team?.id) {
			this.logger?.warn(`User ${userId} not found when loading compliance data`);
			throw new MyObfuscatedError(404, MyObfuscatedErrorType.ERR_AIS_03);
		}

		this.logger?.info(`Getting relevant documents for user ${userId} by team ${user.team.id} for compliance`);
		const teamDocuments = await brokerGetDocuments(this.ctx!, user.team.id);

		this.logger?.info(`Getting statements of user ${userId}`);
		const userStatements = await brokerGetUserStatements(this.ctx!, userId);

		this.logger?.info(`Found ${teamDocuments.length} relevant documents and ${userStatements.length} statements for user ${userId}`);

		const userStatementIds = userStatements.map((us) => us.statement.id);
		const missingDocuments = [];

		this.logger?.info(`Checking compliance of user ${userId} against ${teamDocuments.length} documents`);
		for (const teamDoc of teamDocuments) {
			const generalStatements = teamDoc.versions[0].statements;
			const contentStatements = this.getContentStatements(teamDoc.versions[0]);
			const statements = [...generalStatements, ...contentStatements];
			const missingStatements = statements.filter((s) => !userStatementIds.includes(s.id));

			if (missingStatements.length > 0) {
				this.logger?.info(`User ${userId} is missing statements for document ${teamDoc.id}`);
				missingDocuments.push(teamDoc);
			}
		}
		return {
			compliant: missingDocuments.length === 0,
			missingDocuments,
		};
	}

	getContentStatements(version: DocumentVersion): Statement[] {
		let statements: Statement[] = [];
		for (const content of version.contents) {
			statements = [...statements, ...content.statements];
		}
		return statements;
	}

	async saveUserStatements(statements: UserStatementDTO[], userId: number): Promise<UserStatement[]> {
		const results: UserStatement[] = [];
		const errors: { statement: UserStatementDTO; error: TypeORMError }[] = [];

		this.logger?.info(`Saving ${statements.length} statements for user ${userId}`);

		const promises = statements.map(async (statement) => {
			try {
				const result = await userStatementRepoInstance.saveUserStatement(statement, userId);
				results.push(result);
			} catch (error) {
				this.logger?.error(`Failed to save statement for user ${userId}: ${JSON.stringify(statement)}`, error);
				errors.push({ statement, error });
			}
		});

		await Promise.all(promises);

		if (errors.length > 0) {
			this.logger?.warn(`Finished saving statements with ${errors.length} failures out of ${statements.length} total statements.`);
		}

		return results;
	}
}
