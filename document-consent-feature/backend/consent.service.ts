import type { ServiceSchema } from "moleculer";
import { consentServiceInstance } from "../../instances";
import TypeORMMixin from "../../mixins/typeorm.mixin";
import type { UserStatementDTO } from "./interfaces/user-statement-DTO";
import { consentPost, documentForUser, documentsForUser, getDocumentListForUserSample, userCompliance } from "./sample/sampleResponses";

interface IConsentServiceSettings {
	defaultName: string;
}

const ConsentService: ServiceSchema<IConsentServiceSettings> = {
	name: "consent",
	mixins: [TypeORMMixin],

	actions: {
		getDocumentListForUser: {
			rest: {
				method: "GET",
				path: "/document-list/:userId",
			},
			handler(ctx) {
				const { userId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getDocumentListForUser(userId);
			},
			openapi: {
				responses: getDocumentListForUserSample,
			},
		},

		getDocumentsForUser: {
			rest: {
				method: "GET",
				path: "/documents/:userId",
			},
			params: {
				userId: { type: "number", convert: true },
			},
			handler(ctx) {
				const { userId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getDocumentsForUser(userId);
			},
			openapi: {
				responses: documentsForUser,
			},
		},

		// This might be removed in the future
		getDocumentForUser: {
			rest: {
				method: "GET",
				path: "/documents/:documentId/:userId",
			},
			params: {
				documentId: { type: "number", convert: true },
				userId: { type: "number", convert: true },
			},
			handler(ctx) {
				const { userId, documentId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getDocumentForUser(documentId, userId);
			},
			openapi: {
				responses: documentForUser,
			},
		},

		getDocumentForUserWithVersion: {
			rest: {
				method: "GET",
				path: "/documents/:documentId/:userId/:versionId",
			},
			params: {
				documentId: { type: "number", convert: true },
				userId: { type: "number", convert: true },
				versionId: { type: "number", convert: true },
			},
			handler(ctx) {
				const { userId, documentId, versionId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getDocumentForUser(documentId, userId, versionId);
			},
			openapi: {
				responses: documentForUser,
			},
		},

		getDocumentVersions: {
			rest: {
				method: "GET",
				path: "/documents/versions/:documentId",
			},
			params: {
				documentId: { type: "number", convert: true },
			},
			handler(ctx) {
				const { documentId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getDocumentVersions(documentId);
			},
		},

		getUserCompliance: {
			rest: {
				method: "GET",
				path: "/compliance/:userId",
			},
			params: {
				userId: { type: "number", convert: true },
			},
			handler(ctx) {
				const { userId } = ctx.params;
				return consentServiceInstance.sbp(ctx).getUserCompliance(userId);
			},
			openapi: {
				responses: userCompliance,
			},
		},

		documentResponse: {
			rest: {
				method: "POST",
				path: "/",
			},
			params: {
				userId: { type: "number", convert: true },
				statements: { type: "array" },
			},
			handler(ctx) {
				// eslint-disable-next-line prefer-destructuring
				const statements: UserStatementDTO[] = ctx.params.statements;
				return consentServiceInstance.sbp(ctx).saveUserStatements(statements, ctx.params.userId);
			},
			openapi: {
				consentPost,
			},
		},
	},
};

export default ConsentService;
