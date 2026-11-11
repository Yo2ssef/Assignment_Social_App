export interface IPaginate<T> {
    count: number,
    pages: number,
    page: number,
    limit: number,
    docs: T[] | undefined | null
}