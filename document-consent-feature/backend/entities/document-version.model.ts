import { IsDate, Length } from "class-validator";
import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import DocumentContent from "./document-content.model";
import Document from "./document.model";
import Statement from "./statement.model";

@Entity({ schema: "consent" })
class DocumentVersion extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Document, (document) => document.versions, { onDelete: "CASCADE" })
	document!: Document;

	@Column({ type: "double precision" })
	version!: number;

	@Column({ type: "varchar", length: 5 })
	@Length(1, 5)
	language!: string;

	@Column({ type: "timestamp" })
	@IsDate()
	@Index("ver-validfrom-idx")
	validFrom!: Date;

	@OneToMany(() => DocumentContent, (content) => content.documentVersion)
	contents!: DocumentContent[];

	@OneToMany(() => Statement, (statement) => statement.documentVersion)
	statements!: Statement[];
}

export default DocumentVersion;
