import bcrypt from 'bcrypt';
export const hash = async (plainText: string, rounds: number = 12, minor: "a" | "b" = "b") => {
    if (!plainText) return undefined
    if (typeof plainText == "number") plainText = String(plainText)
    const salt = (await bcrypt.genSalt(rounds, minor)).toString()
    const hashText = await bcrypt.hash(plainText, salt)
    return hashText
}
export const compareHash = async (plainText: string, hashValue: string) => {
    if (!plainText || !hashValue) return undefined
    const result = await bcrypt.compare(plainText, hashValue)
    return result
}