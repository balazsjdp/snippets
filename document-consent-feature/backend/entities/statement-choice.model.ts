import { IsEnum, Length } from "class-validator";
import { AfterInsert, BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import ChoiceAction from "../enums/choice-action.enum";
import Statement from "./statement.model";

@Entity({ schema: "consent" })
class StatementChoice extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Statement, (statement) => statement.choices, { onDelete: "CASCADE" })
	statement!: Statement;

	@Column({ type: "varchar", length: 30 })
	@Length(1, 160)
	choice!: string;

	@Column({ type: "int" })
	order!: number;

	@Column({
		type: "enum",
		enum: ChoiceAction,
		nullable: true,
	})
	@IsEnum(ChoiceAction)
	action!: ChoiceAction;

	@AfterInsert()
	actToAction(): void {
		if (this.action === ChoiceAction.HIDE_PROFILE_IMAGE) {
			// Do something to hide profile image
			// Maybe call an endpoint to delete the image from the storage
			// and/or to insert/update a new "user preference" record
		}

		if (this.action === ChoiceAction.SHOW_PROFILE_IMAGE) {
			// Do something to show profile image
			// Maybe call an endpoint to download profile image
			// and/or to insert/update a new "user preference" record
		}
	}
}

export default StatementChoice;
