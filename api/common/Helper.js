import fs from 'fs/promises'

export const joinURL = (part1, part2) => {
    if (part1.charAt(part1.length - 1) === '/') {
        part1 = part1.substr(0, part1.length - 1)
    }
    if (part2.charAt(0) === '/') {
        part2 = part2.substr(1)
    }
    return part1 + '/' + part2
}

export const clone = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

export const formatNumber = (x) => {
    const parts = x.toString().split(".")
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    return parts.join(".")
}

export const exists = async (path) => {
    try {
        await fs.access(path)
        return true
    } catch {
        return false
    }
}