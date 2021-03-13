function isIterable(x: any): x is Iterable<any> {
  return typeof x[Symbol.iterator] === 'function'
}

function isNumber(x: any): x is number {
  return typeof x === "number"
}

function* map<T, U>(
  iterable: Iterable<T>,
  f: (x: T, i: number) => U
) {
  let i = 0;
  for (const x of iterable)
    yield f(x, i++)
}

function* filter<T>(
  iterable: Iterable<T>,
  f: (x: T, i: number) => boolean
) {
  let i = 0;
  for (const x of iterable)
    if (f(x, i++)) yield x
}

function* forEach<T>(
  iterable: Iterable<T>,
  f:(x: T, i: number) => void
) {
  let i = 0
  for(const x of iterable) {
    f(x, i++)
    yield x
  }
}

function* concat<T>(...iterables: Iterable<T>[]) {
  for (const iterable of iterables)
    for (const x of iterable) yield x
}

function* flat<T extends any>(
  iterable: Iterable<any>, depth?: number
): Generator<T> {
  if (isNumber(depth) && depth < 0)
    throw new Error("Negative depth")

  const subdepth = isNumber(depth)
    ? depth - 1
    : undefined

  for (const x of iterable) {
    if (depth === 0) yield x as T
    else if(typeof x === "string") yield x as T
    else if (!isIterable(x)) yield x as T
    else for (const y of flat(x, subdepth)) yield y as T
  }
}

function* reverse<T>(iterable: Iterable<T>) {
  const stack = []
  for (const x of iterable) stack.unshift(x)
  for (const x of stack) yield x
}

function* pop<T>(iterable: Iterable<T>) {
  let last: T | undefined = undefined;
  let first = true;
  for (const x of iterable) {
    if (!first) yield last
    else first = false
    last = x
  }
}

function* shift<T>(iterable: Iterable<T>) {
  let first = true
  for (const x of iterable) {
    if (first) first = false
    else yield x
  }
}

function* slice<T>(iterable: Iterable<T>, start: number, end: number) {
  let i = 0
  for (const x of iterable) {
    if (i >= start && i <= end) yield x
    if (i++ > end) return
  }
}

function* take<T>(iterable: Iterable<T>, amount: number) {
  let i = 0;
  for (const x of iterable) {
    if (i++ <= amount - 1) yield x
    else return
  }
}

function* drop<T>(iterable: Iterable<T>, amount: number) {
  let i = 0
  for (const x of iterable)
    if (i++ >= amount - 1) yield x
}

export class Sequence<T>{
  constructor(readonly iterable: Iterable<T>) { }

  /**
   * Pipe elements to a function
   * @param f A pipe function
   * @returns A new sequence
   */
  pipe<U>(f: (iter: Iterable<T>) => Iterable<U>){
    const result = f(this.iterable)
    return new Sequence(result)
  }

  /**
   * Map elements to f(x)
   * @param f A transform function
   * @returns A new sequence
   */
  map<U>(f: (x: T, i: number) => U) {
    return this.pipe(iter => map(iter, f))
  }

  /**
   * Remove elements where f(x) = false
   * @param f A predicate function
   * @returns A new sequence
   */
  filter(f: (x: T, i: number) => boolean) {
    return this.pipe(iter => filter(iter, f))
  }

  /**
   * Append one or multiple iterable(s) to the current one
   * @param iterables Iterable(s) to concat
   * @returns A new sequence
   */
  concat(...iterables: Iterable<T>[]) {
    return this.pipe(iter => concat(iter, ...iterables))
  }

  /**
   * Reverse the current iterable
   * @warning /!\ Expensive function
   * @returns A new sequence
   */
  reverse() {
    return this.pipe(iter => reverse(iter))
  }

  /**
   * Remove the last element
   * @see last() for getting it
   * @returns A new sequence
   */
  pop() {
    return this.pipe(iter => pop(iter))
  }

  /**
   * Add elements to the end
   * @returns A new sequence
   */
  push(...elements: T[]) {
    return this.pipe(iter => concat(iter, elements))
  }

  /**
   * Remove the first element
   * @see first() for getting it
   * @returns A new sequence
   */
  shift() {
    return this.pipe(iter => shift(iter))
  }

  /**
   * Add and element to the start
   * @returns A new sequence
   */
  unshift(...elements: T[]) {
    return this.pipe(iter => concat(elements, iter))
  }

  /**
   * Slice elements from start to end
   * @param start Start index
   * @param end End index
   * @returns A new sequence
   */
  slice(start: number, end: number) {
    return this.pipe(iter => slice(iter, start, end))
  }

  /**
   * Take first n elements
   * @param amount n
   * @returns A new sequence
   */
  take(amount: number) {
    return this.pipe(iter => take(iter, amount))
  }

  /**
   * Drop first n elements
   * @param amount n
   * @returns A new sequence
   */
  drop(amount: number) {
    return this.pipe(iter => drop(iter, amount))
  }

  /**
   * Take last elements
   * @warning /!\ Expensive function
   * @returns A new sequence
   */
  takeLast(amount: number) {
    return this.pipe(iter => {
      const array = [...iter]
      const start = array.length - amount
      const end = array.length - 1
      return slice(array, start, end)
    })
  }

  /**
   * Drop last elements
   * @warning /!\ Expensive function
   * @returns A new sequence
   */
  dropLast(amount: number) {
    return this.pipe(iter => {
      const array = [...iter]
      const end = array.length - amount - 1
      return slice(array, 0, end)
    })
  }

  /**
   * Count the elements
   * @returns A number
   */
  count() {
    let i = 0;
    for (const x of this.iterable)
      i++
    return i
  }

  /**
   * Recursively flatten the elements when they are iterables
   * @param depth Recursive depth (will flatten x times)
   * @returns A new sequence
   */
  flat<U>(depth?: number) {
    return this.pipe(iter => flat<U>(iter, depth))
  }

  /**
   * Map x to [x, i] where x is the element and i the index
   * @returns A new sequence
   */
  entries(): Sequence<[T, number]> {
    return this.map((x, i) => [x, i])
  }

  /**
   * Map elements to their index
   * @returns A new sequence
   */
  indexes() {
    return this.map((_, i) => i)
  }

  /**
   * Map x to b when x === a
   * @param a Something
   * @param b Something else
   * @returns A new sequence
   */
  replace<U>(a: T, b: U) {
    return this.map((x) => {
      if (x === a) return b
      else return x
    })
  }

  /**
   * Find the first element where f(x) = true
   * @param f A predicate function
   * @returns The value if found, undefined else
   */
  find(f: (x: T, i: number) => boolean) {
    let i = 0
    for (const x of this.iterable)
      if (f(x, i++)) return x
  }

  /**
   * Check if f(x) = true for some element
   * @param f A predicate function
   * @returns True if the check passed
   */
  some(f: (x: T, i: number) => boolean) {
    return this.find(f) !== undefined
  }

  /**
   * Check if f(x) = true for all elements
   * @param f A predicate function
   * @returns True if the check passed
   */
  every(f: (x: T, i: number) => boolean) {
    return !this.some((x, i) => !f(x, i))
  }

  /**
   * Check if x===y for some element x
   * @param y Element to search
   * @returns A new sequence
   */
  includes(y: T) {
    return this.some(x => (x === y))
  }

  /**
   * Collect elements to an array
   * @returns An array of the values
   */
  collect() {
    return [...this.iterable]
  }

  /**
   * Consume elements
   */
  consume(){
    for(const x of this.iterable){}
  }

  /**
   * Get the first element
   * @returns The first element
   */
  first() {
    for (const x of this.iterable)
      return x
  }

  /**
   * Get the last element
   * @returns The last element
   */
  last() {
    let result: T | undefined = undefined
    for (const x of this.iterable)
      result = x
    return result
  }

  /**
   * Execute f(x,i) for each element
   * @param f A consumer function
   * @returns A new sequence
   */
  forEach(f: (x: T, i: number) => void) {
    return this.pipe(iter => forEach(iter, f))
  }

  /**
   * Sort elements
   * @warning /!\ Expensive function
   * @param f A compare function
   * @returns A new sequence
   */
  sort(f?: (a: T, b: T) => number) {
    return this.pipe(iter => [...iter].sort(f))
  }

  /**
   * Reduce the elements to something
   * @param init Initial value (may be undefined)
   * @param f A reducer function
   * @returns Something
   */
  reduce<U>(init: U,f: (o: U, x: T, i: number) => U) {
    let i = 0
    let result = init
    for (const x of this.iterable)
      result = f(result, x, i++)
    return result
  }

  /**
   * Join the elements, ignoring those not toString()-able
   * @param separator Separator (e.g. [a,b,c] and s => "asbsc")
   * @returns A string
   */
  join(separator: string) {
    let result = ""

    for (const x of this.iterable) {
      let y: string;

      if (typeof x === "string") y = x
      else y = (x as any).toString?.()

      if (!y) continue

      if (!result) result = y
      else result += separator + y
    }

    return result
  }
}