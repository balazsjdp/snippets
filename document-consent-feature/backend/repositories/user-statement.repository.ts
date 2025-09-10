import appDataSource from "../../../connection";
import User from "../../general/user/entities/user.model";
import BaseRepository from "../../utils/base/base-repository";
import StatementChoice from "../entities/statement-choice.model";
import Statement from "../entities/statement.model";
import UserStatement from "../entities/user-statement.model";
import type { UserStatementDTO } from "../interfaces/user-statement-DTO";

export interface IUserStatementRepository {}

export class UserStatementRepository extends BaseRepository implements IUserStatementRepository {
	constructor() {
		super(UserStatement);
	}

	async saveUserStatement(userStatementDTO: UserStatementDTO, userId: number): Promise<UserStatement> {
		const userStatement = new UserStatement();
		// Assign statementTime directly
		userStatement.statementTime = userStatementDTO.statementTime;

		// Fetch and assign the related entities
		userStatement.statement = await appDataSource
			.getRepository(Statement)
			.findOneOrFail({ where: { id: userStatementDTO.statementId } });
		userStatement.choice = await appDataSource
			.getRepository(StatementChoice)
			.findOneOrFail({ where: { id: userStatementDTO.choiceId } });
		userStatement.user = await appDataSource.getRepository(User).findOneOrFail({ where: { id: userId } });

		// Save the entity
		return this.repo.save(userStatement);
	}
}
