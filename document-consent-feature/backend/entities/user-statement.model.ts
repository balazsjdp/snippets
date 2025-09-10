import { IsDate } from "class-validator";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import User from "../../general/user/entities/user.model";
import StatementChoice from "./statement-choice.model";
import Statement from "./statement.model";

@Entity({ schema: "consent" })
class UserStatement extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "timestamp" })
	@IsDate()
	statementTime!: Date;

	@ManyToOne(() => Statement, (statement) => statement.userStatements, { onDelete: "CASCADE" })
	statement!: Statement;

	@ManyToOne(() => StatementChoice, (choice) => choice.id)
	choice!: StatementChoice;

	@ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
	user!: User;

	@RelationId((userStatement: UserStatement) => userStatement.choice)
	choiceId?: number;

	@RelationId((userStatement: UserStatement) => userStatement.statement)
	statementId?: number;
}

export default UserStatement;
