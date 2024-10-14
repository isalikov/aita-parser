import { open, writeFile } from 'node:fs/promises'
import path from 'node:path'

type Flight = {
    from: string
    to: string
    date: string
}

const extractFlight = (line: string): Flight => {
    const [from, to,,,date] = line.split(';').slice(10)

    return {
        from,
        to,
        date
    }
}

const getFlights = async (fileName: string): Promise<Flight[]> => {
    const flights: Flight[] = []

    const file = await open(path.resolve(__dirname, fileName), 'r')

    for await (const line of file.readLines()) {
        if (line.startsWith('None;')) {
            flights.push(extractFlight(line))
        }
    }

    return flights.sort((a, b) => {
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)

        return aDate.getTime() - bDate.getTime()
    })
}

const main = async () => {
    const filename = process.argv[2]
    const output = process.argv[3]

    if (!filename || !output) {
        console.error('Usage: npm start [App In The Air export Data] [output]')
        process.exit(1)
    }

    const flights = await getFlights(filename)
    let csv = 'from,to,date\n'
    for (const flight of flights) {
        csv += `${flight.from},${flight.to},${flight.date}\n`
    }

    await writeFile(`${output}.csv`, csv)
    process.exit(0)
}

main()
