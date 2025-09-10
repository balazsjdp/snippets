import { Length } from "class-validator";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import DocumentTeamRequirement from "./document-team-requirement.model";
import DocumentVersion from "./document-version.model";

@Entity({ schema: "consent" })
class Document extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 50 })
	@Length(1, 50)
	title!: string;

	@Column({ type: "varchar", length: 200 })
	@Length(1, 200)
	description!: string;

	@Column({ type: "varchar", nullable: true, length: 50 })
	@Length(1, 50)
	icon!: string;

	@OneToMany(() => DocumentVersion, (version) => version.document)
	versions!: DocumentVersion[];

	@OneToMany(() => DocumentTeamRequirement, (docTeamReq) => docTeamReq.document)
	requiredTeams!: DocumentTeamRequirement[];
}

export default Document;
