import type { Context } from "moleculer";
import { documentRepositoryInstance } from "../../../instances";
import BaseService from "../../utils/base/base-service";
import type DocumentVersion from "../entities/document-version.model";
import type Document from "../entities/document.model";
import type UserStatement from "../entities/user-statement.model";
import type { DocumentDTO } from "../interfaces/document-DTO";
import type { UserStatementsByVersion } from "../interfaces/user-statement-by-version.interface";

export interface IDocumentService {
	/**
	 * Service broker pattern method.
	 * @param ctx - The Moleculer context.
	 * @returns The current instance of the service.
	 */
	sbp(ctx: Context): this;

	/**
	 * Retrieves all documents.
	 * @returns A promise that resolves to an array of Document objects.
	 */
	getAllDocuments(): Promise<Document[]>;

	/**
	 * Retrieves a specific document by its unique identifier.
	 * @param id - The unique identifier of the document.
	 * @returns A promise that resolves to the Document object.
	 */
	getDocument(id: number): Promise<Document>;

	/**
	 * Retrieves all documents associated with a specific team.
	 * @param teamId - The unique identifier of the team.
	 * @returns A promise that resolves to an array of Document objects belonging to the team.
	 */
	getAllDocumentsByTeamId(teamId: number): Promise<Document[]>;

	/**
	 * Retrieves a list of documents associated with a specific team.
	 *
	 * @param teamId - The unique identifier of the team.
	 * @returns A promise that resolves to an array of DocumentDTO objects. Each DocumentDTO contains the relevant details of the documents, including selected fields and related versions, without returning the requiredTeams relation.
	 */
	getDocumentListByTeamId(teamId: number): Promise<DocumentDTO[]>;

	/**
	 * Retrieves a list of all documents by delegating the call to the `documentRepositoryInstance`.
	 *
	 * @returns A promise that resolves to an array of DocumentDTO objects. The result includes the document details as provided by the `documentRepositoryInstance`.
	 */
	getDocumentListByTeamId(teamId: number): Promise<DocumentDTO[]>;

	/**
	 * Retrieves a list of statements associated with a specific user.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of UserStatement objects. Each UserStatement contains the details of statements linked to the specified user.
	 */
	getUserStatements(userId: number): Promise<UserStatement[]>;

	/**
	 * Retrieves a specific document for a user.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to the Document object if found and accessible by the user.
	 * @throws An error if the document is not accessible or does not exist for the specified user.
	 */
	getDocumentForUser(documentId: number, userId: number): Promise<Document>;

	/**
	 * Retrieves the statement completion ratio for a user based on a specific document.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of UserStatementsByVersion objects. Each object contains details about the user's statements for each version of the specified document.
	 */
	getVersionStatementSummaryForDocument(documentId: number, userId: number): Promise<UserStatementsByVersion[]>;
}

export class DocumentService extends BaseService implements IDocumentService {
	getAllDocuments(): Promise<Document[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getAllDocuments();
	}

	getDocument(id: number): Promise<Document> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentById(id);
	}

	getAllDocumentsByTeamId(teamId: number): Promise<Document[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentsByTeamId(teamId);
	}

	getDocumentList(): Promise<DocumentDTO[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentList();
	}

	getDocumentListByTeamId(teamId: number): Promise<DocumentDTO[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentListByTeamId(teamId);
	}

	getUserStatements(userId: number): Promise<UserStatement[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getUserStatements(userId);
	}

	getDocumentForUser(documentId: number, userId: number, versionId?: number): Promise<Document> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentForUser(documentId, userId, versionId);
	}

	getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
		return documentRepositoryInstance.sbp(this.ctx!).getDocumentVersions(documentId);
	}

	getVersionStatementSummaryForDocument(documentId: number, userId: number): Promise<UserStatementsByVersion[] | []> {
		return documentRepositoryInstance.sbp(this.ctx!).getVersionStatementSummaryForDocument(documentId, userId);
	}
}
