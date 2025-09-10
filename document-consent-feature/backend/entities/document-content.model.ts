import { Length } from "class-validator";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import DocumentVersion from "./document-version.model";
import Statement from "./statement.model";

@Entity({ schema: "consent" })
class DocumentContent extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => DocumentVersion, (documentVersion) => documentVersion.contents, { onDelete: "CASCADE" })
	documentVersion!: DocumentVersion;

	@Column({ type: "varchar", length: 50 })
	@Length(1, 50)
	title!: string;

	@Column({ type: "text" })
	@Length(1)
	content!: string;

	@Column({ type: "int" })
	order!: number;

	@OneToMany(() => Statement, (statement) => statement.documentContent)
	statements!: Statement[];
}

export default DocumentContent;
