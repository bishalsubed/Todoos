import { PrismaClient } from "@prisma/client";

const prismaClientSinglton = () => { 
    return new PrismaClient()
}

type prismaClientSinglton = ReturnType<typeof prismaClientSinglton>

const globalForPrisma = global as unknown as {Prisma:PrismaClient| undefined }
const prisma = globalForPrisma.Prisma ?? prismaClientSinglton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.Prisma = prisma

export default prisma