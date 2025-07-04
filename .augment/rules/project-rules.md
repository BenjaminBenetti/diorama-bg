---
type: "always_apply"
---

# Project Rules

Always apply SOLID Principles

- Single responsibility principle
- Open-closed principle
- Liskov substitution principle
- Interface segregation principle
- Dependency inversion principle

# Ask Questions 
If your unsure about something, always ask the user for clarification.

# Code Organization 

When writing code always organize files according to this structural pattern. Don't be affraid to 
split your code up across multiple fies.
```
<domain>
  <type>
    <typescript file>
```

an example of this pattern is
```
animal
   model 
      catModel.ts 
      dogModel.ts
   service
      animalService.ts 
....
```

# DO NOT MAKE EXAMPLE FILES 
I can't say it enough. Do not create random example files all over the place.