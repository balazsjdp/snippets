import type { Context, ServiceSchema } from "moleculer";
import { documentServiceInstance } from "../../instances";
import type DocumentVersion from "./entities/document-version.model";
import type Document from "./entities/document.model";
import type UserStatement from "./entities/user-statement.model";
import type { DocumentDTO } from "./interfaces/document-DTO";
import type { UserStatementsByVersion } from "./interfaces/user-statement-by-version.interface";

interface IDocumentServiceSettings {
	defaultName: string;
}

/**
 * Retrieves a list of document summaries (DTOs) associated with a specific team via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param teamId - The unique identifier of the team.
 * @returns A promise that resolves to an array of DocumentDTO objects or an empty array if no documents are found.
 */
export const brokerGetDocumentList = (ctx: Context, teamId: number): Promise<DocumentDTO[] | []> =>
	ctx.call<DocumentDTO[] | [], { teamId: number }>("consent/document.brokerGetDocumentList", { teamId });

/**
 * Retrieves a list of documents associated with a specific team via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param teamId - The unique identifier of the team.
 * @returns A promise that resolves to an array of Document objects or an empty array if no documents are found.
 */
export const brokerGetDocuments = (ctx: Context, teamId: number): Promise<Document[] | []> =>
	ctx.call<Document[] | [], { teamId: number }>("consent/document.brokerGetDocuments", { teamId });

/**
 * Retrieves a specific document for a user via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param documentId - The unique identifier of the document.
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to a Document object if the document is accessible to the user, or null if the document is not found or not accessible.
 */
export const brokerGetDocumentForUser = (ctx: Context, documentId: number, userId: number, versionId?: number): Promise<Document | null> =>
	ctx.call<Document | null, { documentId: number; userId: number; versionId?: number }>("consent/document.brokerGetDocumentForUser", {
		documentId,
		userId,
		versionId,
	});

/**
 * Retrieves a list of document versions via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param documentId - The unique identifier of the document.
 * @returns A promise that resolves to an array of DocumentVersion objects or an empty array if no versions are found.
 */
export const brokerGetDocumentVersions = (ctx: Context, documentId: number): Promise<DocumentVersion[] | []> =>
	ctx.call<DocumentVersion[] | [], { documentId: number }>("consent/document.brokerGetDocumentVersions", { documentId });

/**
 * Retrieves a list of user statements via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to an array of UserStatement objects or an empty array if no statements are found.
 */
export const brokerGetUserStatements = (ctx: Context, userId: number): Promise<UserStatement[] | []> =>
	ctx.call<UserStatement[] | [], { userId: number }>("consent/document.brokerGetUserStatements", { userId });

/**
 * Retrieves the statement completion ratio for a user based on a specific document via a brokered service call.
 *
 * @param ctx - The Moleculer context for the service call.
 * @param documentId - The unique identifier of the document.
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to an array of UserStatementsByVersion objects or an empty array if no data is found. Each object contains details about the user's statements for each version of the specified document.
 */
export const brokerGetUserStatementSummary = (ctx: Context, documentId: number, userId: number): Promise<UserStatementsByVersion[] | []> =>
	ctx.call<UserStatementsByVersion[] | [], { documentId: number; userId: number }>("consent/document.brokerGetUserStatementSummary", {
		documentId,
		userId,
	});

const DocumentService: ServiceSchema<IDocumentServiceSettings> = {
	name: "consent/document",

	actions: {
		brokerGetDocumentList: {
			params: {
				teamId: { type: "number", convert: true, optional: true },
			},
			handler(ctx) {
				const { teamId } = ctx.params;

				if (teamId) {
					return documentServiceInstance.sbp(ctx).getDocumentListByTeamId(teamId);
				}

				return documentServiceInstance.sbp(ctx).getDocumentList();
			},
		},

		brokerGetDocuments: {
			params: {
				teamId: { type: "number", convert: true, optional: true },
			},
			handler(ctx) {
				const { teamId } = ctx.params;

				if (teamId) {
					return documentServiceInstance.sbp(ctx).getAllDocumentsByTeamId(teamId);
				}

				return documentServiceInstance.sbp(ctx).getAllDocuments();
			},
		},

		brokerGetDocumentForUser: {
			params: {
				documentId: { type: "number", convert: true },
				userId: { type: "number", convert: true },
				versionId: { type: "number", convert: true, optional: true },
			},
			handler(ctx) {
				const { userId, documentId, versionId } = ctx.params;
				return documentServiceInstance.sbp(ctx).getDocumentForUser(documentId, userId, versionId);
			},
		},

		brokerGetDocumentVersions: {
			params: {
				documentId: { type: "number", convert: true },
			},
			handler(ctx) {
				return documentServiceInstance.sbp(ctx).getDocumentVersions(ctx.params.documentId);
			},
		},
		brokerGetUserStatements: {
			params: {
				userId: { type: "number", convert: true },
			},
			handler(ctx) {
				return documentServiceInstance.sbp(ctx).getUserStatements(ctx.params.userId);
			},
		},

		brokerGetUserStatementSummary: {
			params: {
				documentId: { type: "number", convert: true },
				userId: { type: "number", convert: true },
			},
			handler(ctx) {
				return documentServiceInstance.sbp(ctx).getVersionStatementSummaryForDocument(ctx.params.documentId, ctx.params.userId);
			},
		},
	},
};

export default DocumentService;
