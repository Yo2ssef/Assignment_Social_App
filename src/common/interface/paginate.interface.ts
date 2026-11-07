export interface IPaginate<T> {
    count: number,
    pages: number,
    page: number,
    limit: number,
    data: T[] | undefined | null
}