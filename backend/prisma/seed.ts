import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  for (let i = 1; i <= 30; i++) {
    await prisma.product.create({
      data: {
        name: `Product ${i}`,
        stock: i === 1 ? 100 : Math.floor(Math.random() * 100) + 1, // random stock
      },
    })
  }
  console.log('Seeded 30 products!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
