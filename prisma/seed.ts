import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test Admin',
    },
  })

  console.log({ admin })

  // Seed famous space scientists/astronauts
  const tributes = [
    {
      name: "Carl Sagan",
      birthDate: new Date("1934-11-09"),
      passingDate: new Date("1996-12-20"),
    },
    {
      name: "Neil Armstrong",
      birthDate: new Date("1930-08-05"),
      passingDate: new Date("2012-08-25"),
    },
    {
      name: "Sally Ride",
      birthDate: new Date("1951-05-26"),
      passingDate: new Date("2012-07-23"),
    },
    {
      name: "Stephen Hawking",
      birthDate: new Date("1942-01-08"),
      passingDate: new Date("2018-03-14"),
    },
    {
      name: "Yuri Gagarin",
      birthDate: new Date("1934-03-09"),
      passingDate: new Date("1968-03-27"),
    }
  ]

  for (const t of tributes) {
    const created = await prisma.tribute.upsert({
      where: {
        id: t.name.toLowerCase().replace(" ", "-"), // This won't work perfectly for upsert without unique constraints, but we'll try to find first or create
      },
      update: {},
      create: {
        name: t.name,
        birthDate: t.birthDate,
        passingDate: t.passingDate,
        userId: admin.id,
      },
    }).catch(async (e) => {
      // If no unique constraint to upsert on, just create if not exists
      const exists = await prisma.tribute.findFirst({ where: { name: t.name } })
      if (!exists) {
        return await prisma.tribute.create({ data: { ...t, userId: admin.id } })
      }
      return exists
    })
    console.log(`Tribute seeded: ${created.name}`)
  }
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
