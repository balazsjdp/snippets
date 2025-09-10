export const getDocumentListForUserSample = {
	200: {
		description: "",
		content: {
			"application/json": {
				schema: {
					type: "array",
					items: {
						type: "object",
						example: {
							id: 1,
							title: "Privacy Policy",
							description: "This is a privacy policy document",
							icon: "bi bi-shield-exclamation",
							versions: [
								{
									id: 1,
									version: 1,
									language: "hu",
									validFrom: "2023-12-31T23:00:00.000Z",
									userResponded: false,
								},
								{
									id: 2,
									version: 1.1,
									language: "hu",
									validFrom: "2024-11-30T23:00:00.000Z",
									userResponded: true,
									completionDate: "2024-12-01T14:30:00.000Z",
								},
							],
						},
					},
				},
			},
		},
	},
};

export const documentsForUser = {
	200: {
		description: "",
		content: {
			"application/json": {
				schema: {
					type: "array",
					items: {
						type: "object",
						example: {
							id: 1,
							title: "Privacy Policy",
							description: "This is a privacy policy document",
							icon: "bi bi-shield-exclamation",
							versions: [
								{
									id: 2,
									version: 1.1,
									language: "hu",
									validFrom: "2024-11-30T23:00:00.000Z",
									contents: [
										{
											id: 3,
											title: "How information is used",
											content: " <section></section>",
											order: 2,
											statements: [],
										},
										{
											id: 1,
											title: "Intro",
											content: "<section></section>",
											order: 0,
											statements: [],
										},
										{
											id: 4,
											title: "Sharing information",
											content: " <section></section>",
											order: 3,
											statements: [],
										},
										{
											id: 2,
											title: "Description",
											content: "<section></section>",
											order: 1,
											statements: [],
										},
									],
									statements: [
										{
											id: 1,
											title: "Do you agree?",
											type: "CHECKBOX",
											choices: [
												{
													id: 1,
													choice: "Yes",
													order: 0,
													action: null,
												},
											],
										},
									],
								},
							],
							requiredTeams: [
								{
									id: 1,
									teamId: 2,
								},
							],
						},
					},
				},
			},
		},
	},
};

export const documentForUser = {
	200: {
		description: "",
		content: {
			"application/json": {
				schema: {
					type: "object",
					example: {
						id: 1,
						title: "Privacy Policy",
						description: "This is a privacy policy document",
						icon: "bi bi-shield-exclamation",
						versions: [
							{
								id: 2,
								version: 1.1,
								language: "hu",
								validFrom: "2024-11-30T23:00:00.000Z",
								contents: [
									{
										id: 2,
										title: "Description",
										content:
											"<section>\n        <h2>Information We Collect</h2>\n        <ul>\n            <li>\n                <strong>Personal Information:</strong> We may collect information such as your name, email address, phone number, and payment details when you use our services.\n            </li>\n            <li>\n                <strong>Usage Data:</strong> We collect data about your interactions with our website, including IP address, browser type, and pages visited.\n            </li>\n        </ul>\n    </section>",
										order: 1,
										statements: [],
									},
									{
										id: 4,
										title: "Sharing information",
										content:
											" <section>\n        <h2>Sharing Your Information</h2>\n        <p>We may share your information with third parties in the following situations:</p>\n        <ul>\n            <li>With service providers who perform functions on our behalf, such as payment processing and data analysis.</li>\n            <li>When required by law or to protect our rights and safety.</li>\n            <li>In connection with a merger, sale, or transfer of assets.</li>\n        </ul>\n    </section>",
										order: 3,
										statements: [],
									},
									{
										id: 1,
										title: "Intro",
										content:
											"<section>\n        <h2>Introduction</h2>\n        <p>Welcome to <strong>Our Company</strong>. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>\n    </section>",
										order: 0,
										statements: [],
									},
									{
										id: 3,
										title: "How information is used",
										content:
											" <section>\n        <h2>How We Use Your Information</h2>\n        <p>We use your information for the following purposes:</p>\n        <ol>\n            <li>To provide and improve our services.</li>\n            <li>To process transactions and send updates.</li>\n            <li>To communicate with you, including responding to inquiries and providing support.</li>\n            <li>To comply with legal obligations and enforce our terms of service.</li>\n        </ol>\n    </section>",
										order: 2,
										statements: [],
									},
								],
								statements: [
									{
										id: 1,
										title: "Do you agree?",
										type: "CHECKBOX",
										choices: [
											{
												id: 1,
												choice: "Yes",
												order: 0,
												action: null,
											},
										],
										userStatements: [
											{
												id: 1,
												statementTime: "2024-12-01T23:00:00.000Z",
												choice: {
													id: 1,
													choice: "Yes",
													order: 0,
													action: null,
												},
											},
										],
									},
								],
							},
						],
						requiredTeams: [
							{
								id: 1,
								teamId: 2,
							},
						],
					},
				},
			},
		},
	},
};

export const userCompliance = {
	200: {
		description: "",
		content: {
			"application/json": {
				schema: {
					type: "object",
					example: {
						compliant: false,
						missingDocuments: [
							{
								id: 1,
								title: "Privacy Policy",
								description: "This is a privacy policy document",
								icon: "bi bi-shield-exclamation",
								versions: [
									{
										id: 2,
										version: 1.1,
										language: "hu",
										validFrom: "2024-11-30T23:00:00.000Z",
										contents: [],
										statements: [
											{
												id: 1,
												title: "Do you agree?",
												type: "CHECKBOX",
												choices: [
													{
														id: 1,
														choice: "Yes",
														order: 0,
														action: null,
													},
												],
											},
										],
									},
								],
								requiredTeams: [
									{
										id: 1,
										teamId: 2,
									},
								],
							},
						],
					},
				},
			},
		},
	},
};

export const consentPost = {
	requestBody: {
		content: {
			"application/json": {
				schema: {
					type: "object",
					example: {
						userId: "1",
						statements: [
							{
								statementTime: "2024-12-05",
								statementId: 1,
								choiceId: 1,
							},
							{
								statementTime: "2024-12-05",
								statementId: 2,
								choiceId: 2,
							},
						],
					},
				},
			},
		},
	},
};
