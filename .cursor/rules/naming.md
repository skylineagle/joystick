# Naming Conventions

## Files & Folders

all files and folders names should be kebab-case.

## Variables & Functions

- always use const, not let/var.
- make sure to give variables intuative simple and straight forward names.
- functions should be called by what the functions does and not how


## Components & Types

- each component will be decalred in its own file
- always declared components props as a <componentName>Props interface above the component
- comopnent should be types as FC<the aboved declared props interface>
- components name will be PascalCase
- components structure will be state and hooks at the top, callbacks, then the tsx at the bottom.
- make component SRP and keep it small.