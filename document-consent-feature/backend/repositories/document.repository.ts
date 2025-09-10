import type Moleculer from "moleculer";
import appDataSource from "../../../connection";
import BaseRepository from "../../utils/base/base-repository";
import type DocumentVersion from "../entities/document-version.model";
import Document from "../entities/document.model";
import UserStatement from "../entities/user-statement.model";
import type { DocumentDTO } from "../interfaces/document-DTO";
import type { UserStatementsByVersion } from "../interfaces/user-statement-by-version.interface";

export interface IDocumentRepository {
	sbp(ctx: Moleculer.Context): this;
	/**
	 * Retrieves a list of all documents as DTOs.
	 *
	 * @returns A promise that resolves to an array of DocumentDTO objects.
	 */
	getDocumentList(): Promise<DocumentDTO[]>;

	/**
	 * Retrieves a list of document summaries (DTOs) associated with a specific team.
	 *
	 * @param teamId - The unique identifier of the team.
	 * @returns A promise that resolves to an array of DocumentDTO objects.
	 */
	getDocumentListByTeamId(teamId: number): Promise<DocumentDTO[]>;

	/**
	 * Retrieves all documents.
	 *
	 * @returns A promise that resolves to an array of Document objects.
	 */
	getAllDocuments(): Promise<Document[]>;

	/**
	 * Retrieves a specific document by its unique identifier.
	 *
	 * @param id - The unique identifier of the document.
	 * @returns A promise that resolves to the Document object.
	 */
	getDocumentById(id: number): Promise<Document>;

	/**
	 * Retrieves a specific document for a user.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to the Document object if accessible to the user.
	 */
	getDocumentForUser(documentId: number, userId: number): Promise<Document>;

	/**
	 * Retrieves a list of documents associated with a specific team.
	 *
	 * @param teamId - The unique identifier of the team.
	 * @returns A promise that resolves to an array of Document objects.
	 */
	getDocumentsByTeamId(teamId: number): Promise<Document[]>;

	/**
	 * Retrieves documents for a specific user within a specific team.
	 *
	 * @param userId - The unique identifier of the user.
	 * @param teamId - The unique identifier of the team.
	 * @returns A promise that resolves to an array of Document objects accessible to the user in the specified team.
	 */
	getDocumentsByUserAndTeam(userId: number, teamId: number): Promise<Document[]>;

	/**
	 * Retrieves a list of user statements.
	 *
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of UserStatement objects.
	 */
	getUserStatements(userId: number): Promise<UserStatement[]>;

	/**
	 * Retrieves the statement completion ratio for a user based on a specific document.
	 *
	 * @param documentId - The unique identifier of the document.
	 * @param userId - The unique identifier of the user.
	 * @returns A promise that resolves to an array of UserStatementsByVersion objects containing the user's statement data for each version of the document.
	 */
	getVersionStatementSummaryForDocument(documentId: number, userId: number): Promise<UserStatementsByVersion[]>;
}

export class DocumentRepository extends BaseRepository implements IDocumentRepository {
	constructor() {
		super(Document);
	}

	getDocumentList(): Promise<DocumentDTO[]> {
		return this.repo.find({
			relations: ["versions"],
		});
	}

	getDocumentListByTeamId(teamId: number): Promise<DocumentDTO[]> {
		return this.repo
			.createQueryBuilder("document")
			.leftJoinAndSelect("document.versions", "versions")
			.leftJoinAndSelect("document.requiredTeams", "requiredTeam")
			.where("requiredTeam.teamId = :teamId OR requiredTeam.teamId IS NULL", { teamId })
			.getMany();
	}

	async getAllDocuments(): Promise<Document[]> {
		return this.repo.find();
	}

	async getDocumentById(id: number): Promise<Document> {
		const document: Document = await this.repo.findOne({
			where: { id },
			relations: {
				versions: {
					contents: {
						statements: {
							choices: true,
						},
					},
					statements: {
						choices: true,
					},
				},
			},
		});

		document.versions = document.versions.sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()).slice(0, 1);

		return document;
	}

	async getDocumentForUser(documentId: number, userId: number, versionId?: number): Promise<Document> {
		const query = this.repo
			.createQueryBuilder("document")
			.leftJoinAndSelect("document.versions", "version")
			.leftJoinAndSelect("version.contents", "content")

			.leftJoinAndSelect("content.statements", "contentStatement")
			.leftJoinAndSelect("contentStatement.choices", "contentChoice")
			.leftJoinAndSelect("contentStatement.userStatements", "contentUserStatement", "contentUserStatement.userId = :userId", {
				userId,
			})

			.leftJoinAndSelect("version.statements", "versionStatement")
			.leftJoinAndSelect("versionStatement.choices", "versionChoice")
			.leftJoinAndSelect("versionStatement.userStatements", "versionUserStatement", "versionUserStatement.userId = :userId", {
				userId,
			})

			.leftJoinAndSelect("contentUserStatement.choice", "contentUserChoice")
			.leftJoinAndSelect("versionUserStatement.choice", "versionUserChoice")

			.leftJoinAndSelect("document.requiredTeams", "requiredTeam")
			.where("document.id = :documentId", { documentId });

		if (versionId) {
			query.andWhere("version.id = :versionId", { versionId });
		} else {
			query.andWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select("MAX(version.validFrom)", "maxValidFrom")
					.from("document_version", "version")
					.where("version.documentId = document.id")
					.getQuery();

				return `version.validFrom = (${subQuery})`;
			});
		}

		return query.orderBy("version.validFrom", "DESC").getOne();
	}

	async getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
		const document = await this.repo.findOne({
			where: { id: documentId },
			relations: { versions: true },
		});

		return document?.versions ?? [];
	}

	getDocumentsByTeamId(teamId: number): Promise<Document[]> {
		return this.repo
			.createQueryBuilder("document")
			.leftJoinAndSelect("document.versions", "version")
			.leftJoinAndSelect("version.contents", "content")
			.leftJoinAndSelect("content.statements", "contentStatement")
			.leftJoinAndSelect("contentStatement.choices", "contentChoice")
			.leftJoinAndSelect("contentStatement.userStatements", "contentUserStatement")
			.leftJoinAndSelect("version.statements", "versionStatement")
			.leftJoinAndSelect("versionStatement.choices", "versionChoice")
			.leftJoinAndSelect("document.requiredTeams", "requiredTeam")
			.where("requiredTeam.teamId = :teamId", { teamId })
			.andWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select("MAX(version.validFrom)", "maxValidFrom")
					.from("document_version", "version")
					.where("version.documentId = document.id")
					.getQuery();

				return `version.validFrom = (${subQuery})`;
			})
			.orderBy("version.validFrom", "DESC")
			.getMany();
	}

	getDocumentsByUserAndTeam(userId: number, teamId: number): Promise<Document[]> {
		return this.repo
			.createQueryBuilder("document")
			.leftJoinAndSelect("document.versions", "version")
			.leftJoinAndSelect("version.contents", "content")

			.leftJoinAndSelect("content.statements", "contentStatement")
			.leftJoinAndSelect("contentStatement.choices", "contentChoice")
			.leftJoinAndSelect("contentStatement.userStatements", "contentUserStatement")

			.leftJoinAndSelect("version.statements", "versionStatement")
			.leftJoinAndSelect("versionStatement.choices", "versionChoice")
			.leftJoinAndSelect("versionStatement.userStatements", "versionUserStatement")

			.leftJoinAndSelect("contentUserStatement.choice", "contentUserChoice")
			.leftJoinAndSelect("versionUserStatement.choice", "versionUserChoice")

			.leftJoinAndSelect("document.requiredTeams", "requiredTeam")
			.where("requiredTeam.teamId = :teamId", { teamId })
			.andWhere((qb) => {
				const subQuery = qb
					.subQuery()
					.select("MAX(version.validFrom)", "maxValidFrom")
					.from("document_version", "version")
					.where("version.documentId = document.id")
					.getQuery();

				return `version.validFrom = (${subQuery})`;
			})
			.orderBy("version.validFrom", "DESC")
			.getMany();
	}

	getUserStatements(userId: number): Promise<UserStatement[]> {
		return appDataSource.getRepository(UserStatement).find({
			where: {
				user: {
					id: userId,
				},
			},
			relations: {
				statement: true,
			},
			select: {
				statement: {
					id: true,
				},
			},
		});
	}

	async getVersionStatementSummaryForDocument(documentId: number, userId: number): Promise<UserStatementsByVersion[]> {
		const statementsByVersions = await this.repo
			.createQueryBuilder("document")
			.leftJoin("document.versions", "version")
			.leftJoin("version.statements", "versionStatement")
			.leftJoin("version.contents", "content")
			.leftJoin("content.statements", "contentStatement")
			.leftJoin("versionStatement.userStatements", "userVersionResponse", "userVersionResponse.userId = :userId", { userId })
			.leftJoin("contentStatement.userStatements", "userContentResponse", "userContentResponse.userId = :userId", { userId })
			.where("document.id = :documentId", { documentId })
			.select([
				"version.id AS versionId",
				"COUNT(DISTINCT versionStatement.id) + COUNT(DISTINCT contentStatement.id) AS totalStatements",
				"COUNT(DISTINCT userVersionResponse.id) + COUNT(DISTINCT userContentResponse.id) AS userResponses",
				"MAX(userVersionResponse.statementTime) AS versionCompletionDate",
				"MAX(userContentResponse.statementTime) AS contentCompletionDate",
			])
			.groupBy("version.id")
			.getRawMany();

		return statementsByVersions.map((statement) => {
			const versionCompletionDate = statement.versioncompletiondate;
			const contentCompletionDate = statement.contentcompletiondate;
			let completionDate = null;

			if (versionCompletionDate && contentCompletionDate) {
				completionDate =
					new Date(versionCompletionDate) > new Date(contentCompletionDate) ? versionCompletionDate : contentCompletionDate;
			} else {
				completionDate = versionCompletionDate || contentCompletionDate;
			}

			return {
				versionId: statement.versionid, // No camel case bc of TypeORM :)
				totalStatements: Number(statement.totalstatements), // No camel case bc of TypeORM :)
				userStatements: Number(statement.userresponses), // No camel case bc of TypeORM :)
				completionDate,
			};
		});
	}
}
