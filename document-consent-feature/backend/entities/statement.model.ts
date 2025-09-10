import { IsEnum, Length } from "class-validator";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import StatementType from "../enums/statement-type.enum";
import DocumentContent from "./document-content.model";
import DocumentVersion from "./document-version.model";
import StatementChoice from "./statement-choice.model";
import UserStatement from "./user-statement.model";

@Entity({ schema: "consent" })
class Statement extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 330 })
	@Length(1, 330)
	title!: string;

	@Column({
		type: "enum",
		enum: StatementType,
	})
	@IsEnum(StatementType)
	type!: StatementType;

	@ManyToOne(() => DocumentVersion, (documentVersion) => documentVersion.statements, { nullable: true, onDelete: "SET NULL" })
	documentVersion!: DocumentVersion;

	@ManyToOne(() => DocumentContent, { nullable: true, onDelete: "SET NULL" })
	documentContent!: DocumentContent;

	@OneToMany(() => StatementChoice, (choice) => choice.statement)
	choices!: StatementChoice[];

	@OneToMany(() => UserStatement, (userStatement) => userStatement.statement)
	userStatements!: UserStatement[];
}

export default Statement;
