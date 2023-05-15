import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: "postgresql://myuser:mypassword@database:5432/mydatabase?schema=public",
		},
	},
});

export default prisma;