# Sequence.ts

Iterable piping and processing utility for Deno

Create a new sequence and use .map(), .filter(), etc.

All operations a lazily executed when the iterable is consumed using .collect(), .join(), or .consume(). 

## Usage

    deno cache -r https://deno.land/x/sequence/mod.ts

```typescript
import { Sequence } from "https://deno.land/x/sequence/mod.ts";

const sequence = new Sequence([1,2,3])
    .map((x, i) => x + i)
    .filter(x => x !== 6)
    .forEach(x => console.log(x))
    .pipe(iter => doSomething(iter))
    .concat(generateRandomNumbers(1, 100))
    .take(50)
    .slice(12, 24)
    .join(";")
```

## Test

    deno cache -r https://deno.land/x/sequence/test.ts
    deno run --allow-net https://deno.land/x/sequence/test.ts
