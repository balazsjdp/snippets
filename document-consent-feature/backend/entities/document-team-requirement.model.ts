import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import Team from "../../general/team/entities/team.model";
import Document from "./document.model";

// This is only one "requirement" of a document. We may create additional entities such as this like "DocummentLocationRequirement", etc..

@Entity({ schema: "consent" })
class DocumentTeamRequirement extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Document, (document) => document.id, { onDelete: "CASCADE" })
	document!: Document;

	@ManyToOne(() => Team, (team) => team.id, { onDelete: "CASCADE" })
	team!: Team;

	@RelationId((teamReq: DocumentTeamRequirement) => teamReq.team)
	teamId?: number;
}

export default DocumentTeamRequirement;
