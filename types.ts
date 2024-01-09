//declare type Action = () => void
declare type ActionT<T> = (arg: T) => void

// https://blog.beraliv.dev/2021-04-25-recursive-readonly-for-objects

// type DeepReadonly<T> = {
//     readonly [K in keyof T]: T[K] extends Record<PropertyKey, unknown>
//       ? DeepReadonly<T[K]>
//       : T[K]
//   };