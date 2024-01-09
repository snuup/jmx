declare type Hase = string

declare type Action = () => void
declare type ActionT<T> = (arg: T) => void

declare type Props = {
    update?: ActionT<HTMLElement>
    mounted?: ActionT<HTMLElement>
    patch?: ActionT<HTMLElement>
    //[key: string]: string | number | ActionT<HTMLElement>
}