import { Sequence } from "./mod.ts";

function* generate(){
  while(true)
    yield Math.round(Math.random() * 100)
}

const numbers = 
  new Sequence([1,2,3])
  .push(4,5,6)
  .concat(generate())
  .filter(x => x !== 10)
  .replace(7, 0)
  .take(100)
  .drop(3)
  .takeLast(50)
  .dropLast(2)
  .join("; ")

console.log(numbers)

const hello = 
  new Sequence(["hello", "world", "!"])
  .filter(it => it.includes("o"))
  .map(it => it.toUpperCase())
  .entries().collect()

console.log(hello)

const arrays = new Sequence(["hello", [[[" "]],"w", ["o"], "r"], [[["l"], "d"]], "!"])
  .flat<string>(2)
  .forEach(x => console.log(x))
  .consume()

function* odd(iterable: Iterable<number>){
  for(const x of iterable)
    if(x % 2 === 0) yield x 
    else yield x + 1
}

const odds = new Sequence([1,2,3,4,5,6,7,8])
  .pipe(odd)
  .collect()

console.log(odds)

